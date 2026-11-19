import mongoose, { Schema } from 'mongoose'
import { IProduct, PRODUCT_DECADES, PRODUCT_GRADES, PRODUCT_STATUSES } from '@root/interfaces'

const measurementSchema = new Schema(
    {
        label: { type: String, required: true, trim: true },
        cm: { type: Number, required: true, min: 0 }
    },
    { _id: false }
)

const schema = new Schema<IProduct>(
    {
        shop_id: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        category_id: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        price: { type: Number, required: true, min: 0 },
        size: { type: String, trim: true },
        brand: { type: String, trim: true },
        material: { type: String, trim: true },
        color: { type: String, trim: true },
        era: { type: String, trim: true },
        decade: { type: String, enum: PRODUCT_DECADES },
        grade: { type: String, enum: PRODUCT_GRADES, default: 'B' },
        grade_note: { type: String, trim: true },
        measurements: { type: [measurementSchema], default: [] },
        images: { type: [String], default: [] },
        quantity: { type: Number, default: 1, min: 0 },
        status: { type: String, enum: PRODUCT_STATUSES, default: 'available' },
        published: { type: Number, enum: [0, 1], default: 1 }
    },
    { timestamps: true }
)

schema.index({ slug: 1 }, { unique: true })
schema.index({ category_id: 1, published: 1, createdAt: -1 })
schema.index({ shop_id: 1, createdAt: -1 })
schema.index({ status: 1 })
schema.index({ grade: 1, decade: 1 })

export default mongoose.primary.model<IProduct>('Product', schema, 'products')
