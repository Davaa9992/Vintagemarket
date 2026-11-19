import { Request, Response } from 'express'
import { Types } from 'mongoose'
import logger from '@root/loaders/logger'
import { SHOP_STATUSES } from '@root/interfaces'
import { ShopService } from '@root/services'

/** Бүх дэлгүүр. ?search= */
export const getShops = async (req: Request, res: Response): Promise<void> => {
    try {
        const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined
        res.respondWithData(await ShopService.getAllShops(search))
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}

/** { status: 'active' | 'paused' | 'blocked' } */
export const setShopStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!SHOP_STATUSES.includes(req.body?.status)) {
            res.badRequest(new Error(`Төлөв буруу (${SHOP_STATUSES.join(', ')})`))
            return
        }
        const shop = await ShopService.setStatus(new Types.ObjectId(req.params.id), req.body.status)
        if (!shop) {
            res.documentNotFound(new Error('Дэлгүүр олдсонгүй'))
            return
        }
        res.respondWithData(shop)
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}
