import { Document, Types } from 'mongoose'

/** Нийт захиалгын төлөв */
export const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'completed', 'cancelled'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

/** Худалдагч тус бүрийн хэсгийн төлөв */
export const SHOP_ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] as const
export type ShopOrderStatus = (typeof SHOP_ORDER_STATUSES)[number]

export const PAYMENT_METHODS = ['cash', 'qpay', 'bank_transfer'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const DELIVERY_METHODS = ['ship', 'pickup'] as const
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number]

/** Платформын шимтгэл (10%) ба нэг дэлгүүрийн хүргэлтийн төлбөр */
export const COMMISSION_RATE = 0.1
export const DELIVERY_FEE = 6000

export interface IOrderItem {
    product_id: Types.ObjectId
    shop_id: Types.ObjectId
    name: string
    /** Худалдан авах үеийн үнэ */
    price: number
    quantity: number
    image?: string
}

/** Нэг захиалга худалдагч бүрээр хуваагдана */
export interface IShopOrder {
    shop_id: Types.ObjectId
    shop_name: string
    status: ShopOrderStatus
    subtotal: number
    delivery_fee: number
    commission: number
    payout: number
    shipped_at?: Date
    delivered_at?: Date
}

export interface IOrder extends Document {
    code: string
    user_id?: Types.ObjectId
    customer: { name: string; phone: string; email?: string; address: string }
    items: IOrderItem[]
    shops: IShopOrder[]
    subtotal: number
    delivery_fee: number
    total: number
    delivery: DeliveryMethod
    payment_method: PaymentMethod
    status: OrderStatus
    note?: string
    createdAt?: Date
    updatedAt?: Date
}
