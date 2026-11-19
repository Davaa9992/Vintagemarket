import mongoose, { Schema } from 'mongoose'
import { IShop, SHOP_STATUSES } from '@root/interfaces'

const schema = new Schema<IShop>(
    {
        owner_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, trim: true, lowercase: true },
        initials: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        district: { type: String, trim: true },
        focus: { type: String, trim: true },
        bio: { type: String, trim: true },
        status: { type: String, enum: SHOP_STATUSES, default: 'active' },
        sold_count: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
        rating_count: { type: Number, default: 0 }
    },
    { timestamps: true }
)

schema.index({ slug: 1 }, { unique: true })
schema.index({ owner_id: 1 }, { unique: true })
schema.index({ status: 1, createdAt: -1 })

export default mongoose.primary.model<IShop>('Shop', schema, 'shops')
