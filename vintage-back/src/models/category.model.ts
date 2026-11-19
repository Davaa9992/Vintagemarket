import mongoose, { Schema } from 'mongoose'
import { ICategory } from '@root/interfaces'

const schema = new Schema<ICategory>(
    {
        name: { type: String, required: true, trim: true },
        name_en: { type: String, trim: true },
        slug: { type: String, required: true, trim: true, lowercase: true },
        position: { type: Number, default: 0 }
    },
    { timestamps: true }
)

schema.index({ slug: 1 }, { unique: true })
schema.index({ position: 1, name: 1 })

export default mongoose.primary.model<ICategory>('Category', schema, 'categories')
