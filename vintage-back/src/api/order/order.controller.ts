import { Request, Response } from 'express'
import { Types } from 'mongoose'
import logger from '@root/loaders/logger'
import { OrderService } from '@root/services'
import { FormatHelpers } from '@root/utils'

/** { customer: { name, phone, email?, address }, items: [{ product_id, quantity }], payment_method?, note? } */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { customer, items, payment_method, delivery, note } = req.body
        const result = await OrderService.createOrder({
            user_id: req.user?._id,
            customer: {
                name: String(customer.name).trim(),
                phone: String(customer.phone).trim(),
                email: customer.email ? String(customer.email).trim() : undefined,
                address: String(customer.address).trim()
            },
            items,
            delivery: delivery || 'ship',
            payment_method: payment_method || 'cash',
            note: note ? String(note).slice(0, 1000) : undefined
        })
        if (result.error) {
            res.badRequest(new Error(result.error))
            return
        }
        res.respondWithData(result.order)
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}

/** Нэвтэрсэн хэрэглэгчийн өөрийн захиалгууд */
export const myOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const { items, pagination } = await OrderService.getOrders(req.pagination, { user_id: req.user._id })
        res.respondWithData(items, pagination)
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}

/** ?code=V8F3A1C9B&phone=99112233 — нэвтрээгүй ч захиалгаа шалгана */
export const trackOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code, phone } = req.query as { code?: string; phone?: string }
        if (!code || !phone) {
            res.badRequest(new Error('Захиалгын дугаар, утсаа оруулна уу'))
            return
        }
        const order = await OrderService.trackOrder(code, phone)
        if (!order) {
            res.documentNotFound(new Error('Захиалга олдсонгүй'))
            return
        }
        res.respondWithData(order)
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}

// ---------- Админ

export const getOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, search } = req.query as { status?: string; search?: string }
        const { items, pagination } = await OrderService.getOrders(req.pagination, { status, search: search?.trim() })
        res.respondWithData(items, pagination)
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}

export const getOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const order = await OrderService.getOrder(FormatHelpers.toObjectId(req.params.id))
        if (!order) {
            res.documentNotFound(new Error('Захиалга олдсонгүй'))
            return
        }
        res.respondWithData(order)
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}

/** { status } */
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const order = await OrderService.updateStatus(new Types.ObjectId(req.params.id), req.body.status)
        if (!order) {
            res.documentNotFound(new Error('Захиалга олдсонгүй'))
            return
        }
        res.respondWithData(order)
    } catch (error) {
        if ((error as Error).message?.startsWith('Цуцлагдсан')) {
            res.badRequest(error as Error)
            return
        }
        logger.error(error)
        res.internalError(error as Error)
    }
}

export const getSummary = async (_req: Request, res: Response): Promise<void> => {
    try {
        res.respondWithData(await OrderService.getSummary())
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}
