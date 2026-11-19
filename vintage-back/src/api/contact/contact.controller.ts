import { Request, Response } from 'express'
import { Types } from 'mongoose'
import logger from '@root/loaders/logger'
import { ContactService } from '@root/services'

/** { name, contact, message } — вэбсайтын "Холбоо барих" форм */
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, contact, message } = req.body
        await ContactService.createMessage({
            name: String(name).trim(),
            contact: String(contact).trim(),
            message: String(message).trim()
        })
        res.respondWithData({ status: 'success' })
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}

// ---------- Админ

export const getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const { items, pagination } = await ContactService.getMessages(req.pagination, req.query.unread === '1')
        res.respondWithData(items, pagination)
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}

/** { read: 0 | 1 } */
export const markRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const read = req.body?.read === 0 ? 0 : 1
        const message = await ContactService.markRead(new Types.ObjectId(req.params.id), read)
        if (!message) {
            res.documentNotFound()
            return
        }
        res.respondWithData(message)
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}

export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!(await ContactService.deleteMessage(new Types.ObjectId(req.params.id)))) {
            res.documentNotFound()
            return
        }
        res.respondWithData({ status: 'success' })
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}
