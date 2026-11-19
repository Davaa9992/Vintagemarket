import { Request, Response } from 'express'
import logger from '@root/loaders/logger'
import { ShopService } from '@root/services'

/** Нээлттэй дэлгүүрүүд (идэвхтэй барааны тоотой) */
export const getShops = async (_req: Request, res: Response): Promise<void> => {
    try {
        res.respondWithData(await ShopService.getShops())
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}

/** /shop/:slug */
export const getShop = async (req: Request, res: Response): Promise<void> => {
    try {
        const shop = await ShopService.getShop(req.params.slug)
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
