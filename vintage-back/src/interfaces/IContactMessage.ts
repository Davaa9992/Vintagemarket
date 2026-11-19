import { Document } from 'mongoose'

export interface IContactMessage extends Document {
    name: string
    contact: string
    message: string
    read: number
    createdAt?: Date
    updatedAt?: Date
}
