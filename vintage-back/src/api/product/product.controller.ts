import { Request, Response } from 'express'
import { Types } from 'mongoose'
import logger from '@root/loaders/logger'
import { IProduct } from '@root/interfaces'
import { CategoryService, ProductService, ShopService } from '@root/services'
import { FormatHelpers } from '@root/utils'

const num = (v: unknown): number | undefined => {
    const n = parseFloat(String(v ?? ''))
    return Number.isFinite(n) ? n : undefined
}

/** Админ бол (req.user.role === 'admin') бүх барааг харна */
const isAdmin = (req: Request): boolean => req.user?.role === 'admin'

/** "home,antiques" -> ['home', 'antiques'] */
const list = (v: unknown): string[] | undefined => {
    const items = String(v ?? '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    return items.length ? items.slice(0, 20) : undefined
}

/**
 * ?category=home,antiques&grade=A,B&era=70,80&shop=hadgalsan-tsag&search=&size=M
 * &min_price=&max_price=&sort=newest|price_asc|price_desc&page=&limit=
 */
export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const q = req.query as Record<string, string>
        const { items, pagination } = await ProductService.getProducts(req.pagination, {
            category: list(q.category),
            grade: list(q.grade),
            decade: list(q.era ?? q.decade),
            shop: q.shop?.trim() || undefined,
            shop_id: q.shop_id && FormatHelpers.isObjectId(q.shop_id) && isAdmin(req) ? new Types.ObjectId(q.shop_id) : undefined,
            search: q.search?.trim(),
            size: q.size?.trim(),
            min_price: num(q.min_price),
            max_price: num(q.max_price),
            sort: q.sort as 'newest',
            admin: isAdmin(req),
            status: q.status
        })
        res.respondWithData(items, pagination)
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}

/** /product/:idOrSlug */
export const getProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await ProductService.getProduct(req.params.idOrSlug, isAdmin(req))
        if (!product) {
            res.documentNotFound(new Error('Бараа олдсонгүй'))
            return
        }
        res.respondWithData(product)
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}

/** Худалдагч оруулж болох талбарууд (shop_id-г биеэс авахгүй) */
const FIELDS: (keyof IProduct)[] = [
    'name', 'description', 'category_id', 'price', 'size', 'brand', 'era', 'decade',
    'material', 'color', 'grade', 'grade_note', 'measurements', 'images', 'quantity', 'status', 'published'
]

export const readBody = (body: Partial<IProduct>): Partial<IProduct> => {
    const data = FormatHelpers.pick(body, FIELDS)
    if (data.category_id) data.category_id = new Types.ObjectId(String(data.category_id))
    // Үлдэгдэл нэмэгдвэл дахин зарагдана
    if (data.quantity > 0 && data.status === undefined) data.status = 'available'
    return data
}

/** Админ: аль дэлгүүрийн бараа болохыг shop_id-аар заана */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = readBody(req.body)
        if (!FormatHelpers.isObjectId(req.body?.shop_id) || !(await ShopService.exists(req.body.shop_id))) {
            res.badRequest(new Error('Дэлгүүр олдсонгүй (shop_id)'))
            return
        }
        data.shop_id = new Types.ObjectId(String(req.body.shop_id))
        if (!(await CategoryService.exists(data.category_id))) {
            res.badRequest(new Error('Ангилал олдсонгүй'))
            return
        }
        res.respondWithData(await ProductService.createProduct(data))
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = readBody(req.body)
        if (data.category_id && !(await CategoryService.exists(data.category_id))) {
            res.badRequest(new Error('Ангилал олдсонгүй'))
            return
        }
        const product = await ProductService.updateProduct(new Types.ObjectId(req.params.id), data)
        if (!product) {
            res.documentNotFound(new Error('Бараа олдсонгүй'))
            return
        }
        res.respondWithData(product)
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!(await ProductService.deleteProduct(new Types.ObjectId(req.params.id)))) {
            res.documentNotFound(new Error('Бараа олдсонгүй'))
            return
        }
        res.respondWithData({ status: 'success' })
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}
