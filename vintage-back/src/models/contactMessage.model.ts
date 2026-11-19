import mongoose, { Schema } from 'mongoose'
import { IContactMessage } from '@root/interfaces'

const schema = new Schema<IContactMessage>(
    {
        name: { type: String, required: true, trim: true },
        contact: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },
        read: { type: Number, enum: [0, 1], default: 0 }
    },
    { timestamps: true }
)

schema.index({ read: 1, createdAt: -1 })

export default mongoose.primary.model<IContactMessage>('ContactMessage', schema, 'contact_messages')
