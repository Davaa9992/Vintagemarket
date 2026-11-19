import { FilterQuery, Types } from 'mongoose'
import { Order, Product, Shop } from '@root/models'
import {
    DeliveryMethod,
    IOrder,
    IOrderItem,
    IPagination,
    OrderStatus,
    PaymentMethod,
    ShopOrderStatus
} from '@root/interfaces'
import { FormatHelpers, OrderHelpers } from '@root/utils'

export interface OrderCreate {
    user_id?: Types.ObjectId
    customer: { name: string; phone: string; email?: string; address: string }
    items: { product_id: string; quantity: number }[]
    delivery: DeliveryMethod
    payment_method: PaymentMethod
    note?: string
}

/** Барааны үлдэгдлийг буцаана (захиалга цуцлах, алдаа гарах үед) */
const restock = async (items: { product_id: Types.ObjectId; quantity: number }[]): Promise<void> => {
    for (const item of items) {
        await Product.updateOne(
            { _id: item.product_id },
            { $inc: { quantity: item.quantity }, $set: { status: 'available' } }
        )
    }
}

/**
 * Захиалга үүсгэнэ. Бараа бүрийн үлдэгдлийг атомаар хасна; дуусвал "reserved" болно.
 * Аль нэг бараа дууссан бол өмнө хассан үлдэгдлийг буцаагаад алдаа өгнө.
 * Захиалгыг дэлгүүр бүрээр хувааж, шимтгэл, хүргэлтийг тооцно
 */
const createOrder = async (data: OrderCreate): Promise<{ order?: IOrder; error?: string }> => {
    const taken: IOrderItem[] = []
    for (const { product_id, quantity } of data.items) {
        const product = await Product.findOneAndUpdate(
            { _id: product_id, published: 1, status: 'available', quantity: { $gte: quantity } },
            { $inc: { quantity: -quantity } },
            { new: true }
        )
        if (!product) {
            await restock(taken)
            const p = await Product.findById(product_id).select('name').lean()
            return { error: p ? `"${p.name}" бараа дууссан эсвэл захиалгад орсон байна` : 'Бараа олдсонгүй' }
        }
        if (product.quantity === 0) await Product.updateOne({ _id: product._id }, { status: 'reserved' })
        taken.push({
            product_id: product._id,
            shop_id: product.shop_id,
            name: product.name,
            price: product.price,
            quantity,
            image: product.images[0]
        })
    }
    try {
        const shopIds = [...new Set(taken.map((i) => String(i.shop_id)))]
        const shops = await Shop.find({ _id: { $in: shopIds } }).select('name').lean()
        const names = new Map(shops.map((s) => [String(s._id), s.name]))
        const totals = OrderHelpers.splitByShop(taken, data.delivery, names)
        const order = await Order.create({
            code: FormatHelpers.orderCode(),
            user_id: data.user_id,
            customer: data.customer,
            items: taken,
            ...totals,
            delivery: data.delivery,
            payment_method: data.payment_method,
            note: data.note
        })
        return { order: order.toObject() }
    } catch (error) {
        await restock(taken)
        throw error
    }
}

const getOrders = async (pagination: IPagination, f: { status?: string; search?: string; user_id?: Types.ObjectId }) => {
    const filter: FilterQuery<IOrder> = {}
    if (f.user_id) filter.user_id = f.user_id
    if (f.status) filter.status = f.status
    if (f.search) {
        const re = new RegExp(FormatHelpers.escapeRegex(f.search), 'i')
        filter.$or = [{ code: re }, { 'customer.name': re }, { 'customer.phone': re }]
    }
    const [items, total] = await Promise.all([
        Order.find(filter).sort({ createdAt: -1 }).skip(pagination.offset).limit(pagination.limit).lean(),
        Order.countDocuments(filter)
    ])
    return { items, pagination: { ...pagination, total, total_page: Math.ceil(total / pagination.limit) } }
}

const getOrder = async (id: Types.ObjectId) => Order.findById(id).lean()

/** Захиалгын дугаар + утсаар (нэвтрээгүй худалдан авагч захиалгаа шалгах) */
const trackOrder = async (code: string, phone: string) =>
    Order.findOne({
        code: code.toUpperCase().trim(),
        // "+976 9911-2233" -> "99112233"
        'customer.phone': phone.replace(/\D/g, '').replace(/^976(?=\d{8}$)/, '')
    })
        .select('code status shops.shop_name shops.status items total delivery payment_method createdAt')
        .lean()

/** Дэлгүүр бүрт хүргэгдсэн барааг "sold" болгож, зарагдсан тоог нэмнэ */
const markDelivered = async (order: { items: IOrderItem[] }, shopId: Types.ObjectId): Promise<void> => {
    const items = order.items.filter((i) => String(i.shop_id) === String(shopId))
    await Product.updateMany({ _id: { $in: items.map((i) => i.product_id) }, quantity: 0 }, { status: 'sold' })
    await Shop.updateOne({ _id: shopId }, { $inc: { sold_count: items.reduce((s, i) => s + i.quantity, 0) } })
}

/**
 * Админ нийт төлөвийг солино. paid бол бүх хэсэг paid болно,
 * цуцлагдвал үлдэгдэл буцна, completed бол бүх хэсэг хүргэгдсэн болно
 */
const updateStatus = async (id: Types.ObjectId, status: OrderStatus) => {
    const order = await Order.findById(id)
    if (!order) return null
    if (order.status === status) return order.toObject()
    if (order.status === 'cancelled') throw new Error('Цуцлагдсан захиалгын төлөвийг солих боломжгүй')
    const partStatus: Partial<Record<OrderStatus, ShopOrderStatus>> = {
        paid: 'paid',
        shipped: 'shipped',
        completed: 'delivered',
        cancelled: 'cancelled'
    }
    const next = partStatus[status]
    if (status === 'cancelled') await restock(order.items)
    for (const part of order.shops) {
        if (!next || part.status === 'cancelled' || part.status === 'delivered') continue
        if (next === 'delivered') {
            await markDelivered(order, part.shop_id)
            part.delivered_at = new Date()
        }
        part.status = next
    }
    order.status = status
    await order.save()
    return order.toObject()
}

/** Худалдагч өөрийн хэсгийн төлөвийг солино (илгээсэн, хүргэгдсэн) */
const updateShopStatus = async (
    id: Types.ObjectId,
    shopId: Types.ObjectId,
    status: ShopOrderStatus
): Promise<{ order?: IOrder; error?: string }> => {
    const order = await Order.findOne({ _id: id, 'shops.shop_id': shopId })
    if (!order) return { error: 'Захиалга олдсонгүй' }
    const part = order.shops.find((s) => String(s.shop_id) === String(shopId))
    if (!OrderHelpers.canSellerMove(part.status, status)) {
        return { error: `"${part.status}" төлвөөс "${status}" болгох боломжгүй` }
    }
    if (status === 'cancelled') {
        await restock(order.items.filter((i) => String(i.shop_id) === String(shopId)))
    }
    if (status === 'shipped') part.shipped_at = new Date()
    if (status === 'delivered') {
        part.delivered_at = new Date()
        await markDelivered(order, shopId)
    }
    part.status = status
    order.status = OrderHelpers.overallStatus(
        order.status,
        order.shops.map((s) => s.status)
    )
    await order.save()
    return { order: order.toObject() }
}

/** Худалдагчийн захиалгууд: зөвхөн өөрийн бараа, өөрийн хэсэг харагдана */
const getShopOrders = async (shopId: Types.ObjectId, pagination: IPagination, status?: string) => {
    const filter: FilterQuery<IOrder> = { 'shops.shop_id': shopId }
    if (status) filter.shops = { $elemMatch: { shop_id: shopId, status } }
    const [orders, total] = await Promise.all([
        Order.find(filter).sort({ createdAt: -1 }).skip(pagination.offset).limit(pagination.limit).lean(),
        Order.countDocuments(filter)
    ])
    const items = orders.map((o) => {
        const part = o.shops.find((s) => String(s.shop_id) === String(shopId))
        return {
            _id: o._id,
            code: o.code,
            createdAt: o.createdAt,
            customer: o.customer,
            delivery: o.delivery,
            payment_method: o.payment_method,
            note: o.note,
            items: o.items.filter((i) => String(i.shop_id) === String(shopId)),
            ...part
        }
    })
    return { items, pagination: { ...pagination, total, total_page: Math.ceil(total / pagination.limit) } }
}

/** Худалдагчийн самбарын тоо: энэ сарын борлуулалт, олгох дүн, илгээх захиалга */
const getShopSummary = async (shopId: Types.ObjectId) => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const [month, toShip, active, drafts] = await Promise.all([
        Order.aggregate<{ _id: null; sales: number; commission: number; payout: number; items: number }>([
            { $match: { 'shops.shop_id': shopId, createdAt: { $gte: monthStart } } },
            { $unwind: '$shops' },
            { $match: { 'shops.shop_id': shopId, 'shops.status': { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: null,
                    sales: { $sum: '$shops.subtotal' },
                    commission: { $sum: '$shops.commission' },
                    payout: { $sum: '$shops.payout' },
                    items: { $sum: 1 }
                }
            }
        ]),
        Order.countDocuments({ shops: { $elemMatch: { shop_id: shopId, status: { $in: ['pending', 'paid'] } } } }),
        Product.countDocuments({ shop_id: shopId, published: 1, status: 'available' }),
        Product.countDocuments({ shop_id: shopId, published: 0 })
    ])
    const m = month[0]
    return {
        month_sales: m?.sales ?? 0,
        month_commission: m?.commission ?? 0,
        month_payout: m?.payout ?? 0,
        month_orders: m?.items ?? 0,
        to_ship: toShip,
        active_listings: active,
        drafts
    }
}

/** Админы самбарт: төлөв бүрийн тоо, нийт борлуулалт, шимтгэл */
const getSummary = async () => {
    const [byStatus, revenue] = await Promise.all([
        Order.aggregate<{ _id: string; count: number }>([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Order.aggregate<{ _id: null; total: number; commission: number }>([
            { $match: { status: { $in: ['paid', 'shipped', 'completed'] } } },
            { $unwind: '$shops' },
            { $group: { _id: null, total: { $sum: '$shops.subtotal' }, commission: { $sum: '$shops.commission' } } }
        ])
    ])
    return {
        by_status: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
        revenue: revenue[0]?.total ?? 0,
        commission: revenue[0]?.commission ?? 0
    }
}

const OrderService = {
    createOrder,
    getOrders,
    getOrder,
    trackOrder,
    updateStatus,
    updateShopStatus,
    getShopOrders,
    getShopSummary,
    getSummary
}

export default OrderService
