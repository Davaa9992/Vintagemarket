import { Request, Response } from 'express'
import { Types } from 'mongoose'
import logger from '@root/loaders/logger'
import { IShop, ShopOrderStatus } from '@root/interfaces'
import { CategoryService, OrderService, ProductService, ShopService } from '@root/services'
import { FormatHelpers } from '@root/utils'
import { readBody } from '../product/product.controller'

const SHOP_FIELDS: (keyof IShop)[] = ['name', 'city', 'district', 'focus', 'bio']

const fail = (res: Response, error: unknown): void => {
    logger.error(error)
    res.internalError(error as Error)
}

/** Дэлгүүр нээх (нэвтэрсэн хэрэглэгч, нэг хүн нэг дэлгүүр) */
export const createShop = async (req: Request, res: Response): Promise<void> => {
    try {
        if (await ShopService.getByOwner(req.user._id)) {
            res.badRequest(new Error('Танд дэлгүүр аль хэдийн байна'))
            return
        }
        res.respondWithData(await ShopService.createShop(req.user._id, FormatHelpers.pick(req.body, SHOP_FIELDS)))
    } catch (error) {
        fail(res, error)
    }
}

export const getMyShop = async (req: Request, res: Response): Promise<void> => {
    res.respondWithData(req.shop)
}

export const updateMyShop = async (req: Request, res: Response): Promise<void> => {
    try {
        res.respondWithData(await ShopService.updateShop(req.shop._id, FormatHelpers.pick(req.body, SHOP_FIELDS)))
    } catch (error) {
        fail(res, error)
    }
}

/** Өөрийн бараа (нийтлэгдээгүй, зарагдсан ч орно). ?status=available|sold */
export const getMyProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const q = req.query as Record<string, string>
        const { items, pagination } = await ProductService.getProducts(req.pagination, {
            shop_id: req.shop._id,
            status: q.status,
            search: q.search?.trim(),
            sort: q.sort as 'newest'
        })
        res.respondWithData(items, pagination)
    } catch (error) {
        fail(res, error)
    }
}

export const getMyProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await ProductService.findOwned(new Types.ObjectId(req.params.id), req.shop._id)
        if (!product) {
            res.documentNotFound(new Error('Бараа олдсонгүй'))
            return
        }
        res.respondWithData(product)
    } catch (error) {
        fail(res, error)
    }
}

export const createMyProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = readBody(req.body)
        if (!(await CategoryService.exists(data.category_id))) {
            res.badRequest(new Error('Ангилал олдсонгүй'))
            return
        }
        res.respondWithData(await ProductService.createProduct({ ...data, shop_id: req.shop._id }))
    } catch (error) {
        fail(res, error)
    }
}

export const updateMyProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = new Types.ObjectId(req.params.id)
        if (!(await ProductService.findOwned(id, req.shop._id))) {
            res.documentNotFound(new Error('Бараа олдсонгүй'))
            return
        }
        const data = readBody(req.body)
        if (data.category_id && !(await CategoryService.exists(data.category_id))) {
            res.badRequest(new Error('Ангилал олдсонгүй'))
            return
        }
        res.respondWithData(await ProductService.updateProduct(id, data))
    } catch (error) {
        fail(res, error)
    }
}

export const deleteMyProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = new Types.ObjectId(req.params.id)
        if (!(await ProductService.findOwned(id, req.shop._id))) {
            res.documentNotFound(new Error('Бараа олдсонгүй'))
            return
        }
        if (!(await ProductService.deleteProduct(id))) {
            res.badRequest(new Error('Зарагдсан барааг устгах боломжгүй'))
            return
        }
        res.respondWithData({ status: 'success' })
    } catch (error) {
        fail(res, error)
    }
}

/** Өөрийн захиалгууд. ?status=pending|paid|shipped|delivered|cancelled */
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const status = typeof req.query.status === 'string' ? req.query.status : undefined
        const { items, pagination } = await OrderService.getShopOrders(req.shop._id, req.pagination, status)
        res.respondWithData(items, pagination)
    } catch (error) {
        fail(res, error)
    }
}

export const updateMyOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { order, error } = await OrderService.updateShopStatus(
            new Types.ObjectId(req.params.id),
            req.shop._id,
            req.body.status as ShopOrderStatus
        )
        if (error) {
            res.badRequest(new Error(error))
            return
        }
        res.respondWithData(order)
    } catch (error) {
        fail(res, error)
    }
}

export const getMySummary = async (req: Request, res: Response): Promise<void> => {
    try {
        res.respondWithData(await OrderService.getShopSummary(req.shop._id))
    } catch (error) {
        fail(res, error)
    }
}
