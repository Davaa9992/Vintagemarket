import mongoose, { Schema } from 'mongoose'
import { DELIVERY_METHODS, IOrder, ORDER_STATUSES, PAYMENT_METHODS, SHOP_ORDER_STATUSES } from '@root/interfaces'

const itemSchema = new Schema(
    {
        product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        shop_id: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String }
    },
    { _id: false }
)

// Худалдагч бүрийн хэсэг: өөрийн төлөв, дүн, шимтгэл, олгох дүн
const shopOrderSchema = new Schema(
    {
        shop_id: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
        shop_name: { type: String, required: true },
        status: { type: String, enum: SHOP_ORDER_STATUSES, default: 'pending' },
        subtotal: { type: Number, required: true, min: 0 },
        delivery_fee: { type: Number, default: 0, min: 0 },
        commission: { type: Number, required: true, min: 0 },
        payout: { type: Number, required: true, min: 0 },
        shipped_at: { type: Date },
        delivered_at: { type: Date }
    },
    { _id: false }
)

const schema = new Schema<IOrder>(
    {
        code: { type: String, required: true },
        user_id: { type: Schema.Types.ObjectId, ref: 'User' },
        customer: {
            name: { type: String, required: true, trim: true },
            phone: { type: String, required: true, trim: true },
            email: { type: String, trim: true, lowercase: true },
            address: { type: String, required: true, trim: true }
        },
        items: { type: [itemSchema], required: true },
        shops: { type: [shopOrderSchema], required: true },
        subtotal: { type: Number, required: true, min: 0 },
        delivery_fee: { type: Number, default: 0, min: 0 },
        total: { type: Number, required: true, min: 0 },
        delivery: { type: String, enum: DELIVERY_METHODS, default: 'ship' },
        payment_method: { type: String, enum: PAYMENT_METHODS, default: 'cash' },
        status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
        note: { type: String, trim: true }
    },
    { timestamps: true }
)

schema.index({ code: 1 }, { unique: true })
schema.index({ user_id: 1, createdAt: -1 })
schema.index({ status: 1, createdAt: -1 })
schema.index({ 'shops.shop_id': 1, createdAt: -1 })

export default mongoose.primary.model<IOrder>('Order', schema, 'orders')
