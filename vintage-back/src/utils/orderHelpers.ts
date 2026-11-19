import { Types } from 'mongoose'
import {
    COMMISSION_RATE,
    DELIVERY_FEE,
    DeliveryMethod,
    IOrderItem,
    IShopOrder,
    OrderStatus,
    ShopOrderStatus
} from '@root/interfaces'

export interface OrderTotals {
    shops: IShopOrder[]
    subtotal: number
    delivery_fee: number
    total: number
}

/**
 * Захиалгын барааг дэлгүүрээр нь бүлэглэж, дэлгүүр бүрийн дүн, хүргэлт,
 * 10% шимтгэл, худалдагчид олгох дүнг тооцно. Хүргэлтийн төлбөр худалдагчид бүтнээрээ очно
 */
function splitByShop(
    items: Pick<IOrderItem, 'shop_id' | 'price' | 'quantity'>[],
    delivery: DeliveryMethod,
    shopNames: Map<string, string>
): OrderTotals {
    const byShop = new Map<string, number>()
    for (const item of items) {
        const key = String(item.shop_id)
        byShop.set(key, (byShop.get(key) ?? 0) + item.price * item.quantity)
    }
    const shops: IShopOrder[] = [...byShop.entries()].map(([id, subtotal]) => {
        const commission = Math.round(subtotal * COMMISSION_RATE)
        const delivery_fee = delivery === 'ship' ? DELIVERY_FEE : 0
        return {
            shop_id: new Types.ObjectId(id),
            shop_name: shopNames.get(id) ?? '',
            status: 'pending',
            subtotal,
            delivery_fee,
            commission,
            payout: subtotal - commission + delivery_fee
        }
    })
    const subtotal = shops.reduce((s, x) => s + x.subtotal, 0)
    const delivery_fee = shops.reduce((s, x) => s + x.delivery_fee, 0)
    return { shops, subtotal, delivery_fee, total: subtotal + delivery_fee }
}

/** Худалдагч өөрийн хэсгийн төлөвийг ингэж л ахиулна */
const SELLER_TRANSITIONS: Record<ShopOrderStatus, ShopOrderStatus[]> = {
    pending: ['shipped', 'cancelled'],
    paid: ['shipped'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: []
}

function canSellerMove(from: ShopOrderStatus, to: ShopOrderStatus): boolean {
    return SELLER_TRANSITIONS[from].includes(to)
}

/** Дэлгүүрүүдийн хэсгийн төлөвөөс нийт захиалгын төлөвийг гаргана */
function overallStatus(current: OrderStatus, parts: ShopOrderStatus[]): OrderStatus {
    const live = parts.filter((s) => s !== 'cancelled')
    if (!live.length) return 'cancelled'
    if (live.every((s) => s === 'delivered')) return 'completed'
    if (live.every((s) => s === 'shipped' || s === 'delivered')) return 'shipped'
    return current === 'shipped' || current === 'completed' ? 'paid' : current
}

export default { splitByShop, canSellerMove, overallStatus }
