import { Types } from 'mongoose'
import { ContactMessage } from '@root/models'
import { IPagination } from '@root/interfaces'

const createMessage = async (data: { name: string; contact: string; message: string }) =>
    (await ContactMessage.create(data)).toObject()

const getMessages = async (pagination: IPagination, unreadOnly = false) => {
    const filter = unreadOnly ? { read: 0 } : {}
    const [items, total] = await Promise.all([
        ContactMessage.find(filter).sort({ createdAt: -1 }).skip(pagination.offset).limit(pagination.limit).lean(),
        ContactMessage.countDocuments(filter)
    ])
    return { items, pagination: { ...pagination, total, total_page: Math.ceil(total / pagination.limit) } }
}

const markRead = async (id: Types.ObjectId, read: 0 | 1) =>
    ContactMessage.findByIdAndUpdate(id, { read }, { new: true }).lean()

const deleteMessage = async (id: Types.ObjectId): Promise<boolean> =>
    (await ContactMessage.deleteOne({ _id: id })).deletedCount > 0

const ContactService = { createMessage, getMessages, markRead, deleteMessage }

export default ContactService
