import { Request, Response, NextFunction } from 'express'
import { FormatHelpers } from '@root/utils'
import {
    DELIVERY_METHODS,
    ORDER_STATUSES,
    PAYMENT_METHODS,
    PRODUCT_DECADES,
    PRODUCT_GRADES,
    PRODUCT_STATUSES,
    SHOP_ORDER_STATUSES
} from '@root/interfaces'

/** URL параметрүүд зөв ObjectId эсэхийг шалгана: validateIds('id') */
const validateIds =
    (...names: string[]) =>
    (req: Request, res: Response, next: NextFunction): void => {
        for (const name of names) {
            if (!FormatHelpers.isObjectId(req.params[name])) {
                res.badRequest(new Error(`${name} буруу байна`))
                return
            }
        }
        next()
    }

const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** Монгол утас: 8 оронтой (+976 угтвартай байж болно) */
const PHONE_RE = /^(\+?976[\s-]?)?\d{4}[\s-]?\d{4}$/
const digits = (v: unknown): string => String(v ?? '').replace(/\D/g, '').replace(/^976(?=\d{8}$)/, '')
const PASSWORD_ERROR = 'Нууц үг хамгийн багадаа 8 тэмдэгт, үсэг болон тоо агуулсан байна'

const isBlank = (v: unknown): boolean => !String(v ?? '').trim()
const isFlag = (v: unknown): boolean => v === 0 || v === 1

const signupMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const data = req.body || {}
    if (!PHONE_RE.test(String(data.phone || '').trim())) {
        res.badRequest(new Error('8 оронтой утасны дугаар оруулна уу!'))
        return
    }
    data.phone = digits(data.phone)
    if (!isBlank(data.email)) {
        data.email = String(data.email).toLowerCase().trim()
        if (!EMAIL_RE.test(data.email)) {
            res.badRequest(new Error('Имэйл буруу байна'))
            return
        }
    } else delete data.email
    if (isBlank(data.full_name)) {
        res.badRequest(new Error('Овог нэрээ оруулна уу!'))
        return
    }
    if (!PASSWORD_RE.test(String(data.password || ''))) {
        res.badRequest(new Error(PASSWORD_ERROR))
        return
    }
    next()
}

const passwordMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    if (!PASSWORD_RE.test(String(req.body?.newPassword || ''))) {
        res.badRequest(new Error(PASSWORD_ERROR))
        return
    }
    next()
}

const categoryMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const data = req.body || {}
    const isCreate = req.method === 'POST'
    if ((isCreate || data.name !== undefined) && (isBlank(data.name) || String(data.name).length > 60)) {
        res.badRequest(new Error('Ангиллын нэр оруулна уу (60 тэмдэгт хүртэл)'))
        return
    }
    if (data.position !== undefined && !Number.isInteger(data.position)) {
        res.badRequest(new Error('position нь бүхэл тоо байна'))
        return
    }
    next()
}

const productMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const data = req.body || {}
    const isCreate = req.method === 'POST'
    if ((isCreate || data.name !== undefined) && isBlank(data.name)) {
        res.badRequest(new Error('Барааны нэр оруулна уу!'))
        return
    }
    if ((isCreate || data.category_id !== undefined) && !FormatHelpers.isObjectId(data.category_id)) {
        res.badRequest(new Error('Ангилал сонгоно уу!'))
        return
    }
    if ((isCreate || data.price !== undefined) && !(typeof data.price === 'number' && data.price >= 0)) {
        res.badRequest(new Error('Үнэ 0-ээс их тоо байна'))
        return
    }
    if (data.quantity !== undefined && !(Number.isInteger(data.quantity) && data.quantity >= 0)) {
        res.badRequest(new Error('Тоо ширхэг 0 эсвэл түүнээс их бүхэл тоо байна'))
        return
    }
    if (data.grade !== undefined && !PRODUCT_GRADES.includes(data.grade)) {
        res.badRequest(new Error(`Төлвийн зэрэглэл буруу (${PRODUCT_GRADES.join(', ')})`))
        return
    }
    if (data.decade !== undefined && data.decade !== null && !PRODUCT_DECADES.includes(data.decade)) {
        res.badRequest(new Error(`Он үе буруу (${PRODUCT_DECADES.join(', ')})`))
        return
    }
    if (data.measurements !== undefined) {
        const ok =
            Array.isArray(data.measurements) &&
            data.measurements.length <= 12 &&
            data.measurements.every(
                (m: { label?: unknown; cm?: unknown }) => !isBlank(m?.label) && typeof m.cm === 'number' && m.cm >= 0
            )
        if (!ok) {
            res.badRequest(new Error('Хэмжээ нь { label, cm } жагсаалт байна (12 хүртэл)'))
            return
        }
    }
    if (data.status !== undefined && !PRODUCT_STATUSES.includes(data.status)) {
        res.badRequest(new Error(`Төлөв буруу (${PRODUCT_STATUSES.join(', ')})`))
        return
    }
    if (data.published !== undefined && !isFlag(data.published)) {
        res.badRequest(new Error('published нь 0 эсвэл 1 байна'))
        return
    }
    if (data.images !== undefined) {
        if (!Array.isArray(data.images) || data.images.length > 10 || !data.images.every(FormatHelpers.isUrl)) {
            res.badRequest(new Error('images нь 10 хүртэл зөв линкийн жагсаалт байна'))
            return
        }
    }
    next()
}

const orderMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const data = req.body || {}
    const c = data.customer || {}
    if (isBlank(c.name)) {
        res.badRequest(new Error('Нэрээ оруулна уу!'))
        return
    }
    if (!PHONE_RE.test(String(c.phone || '').trim())) {
        res.badRequest(new Error('8 оронтой утасны дугаараа оруулна уу!'))
        return
    }
    c.phone = digits(c.phone)
    if (!isBlank(c.email) && !EMAIL_RE.test(String(c.email).trim())) {
        res.badRequest(new Error('Имэйл буруу байна'))
        return
    }
    if (isBlank(c.address)) {
        res.badRequest(new Error('Хүргэлтийн хаягаа оруулна уу!'))
        return
    }
    if (!Array.isArray(data.items) || !data.items.length || data.items.length > 50) {
        res.badRequest(new Error('Сагс хоосон байна'))
        return
    }
    const ids = new Set<string>()
    for (const item of data.items) {
        if (!FormatHelpers.isObjectId(item?.product_id) || !Number.isInteger(item.quantity) || item.quantity < 1) {
            res.badRequest(new Error('Сагсны бараа буруу байна'))
            return
        }
        if (ids.has(item.product_id)) {
            res.badRequest(new Error('Нэг бараа сагсанд давхардсан байна'))
            return
        }
        ids.add(item.product_id)
    }
    if (data.delivery !== undefined && !DELIVERY_METHODS.includes(data.delivery)) {
        res.badRequest(new Error(`Хүргэлтийн хэлбэр буруу (${DELIVERY_METHODS.join(', ')})`))
        return
    }
    if (data.payment_method !== undefined && !PAYMENT_METHODS.includes(data.payment_method)) {
        res.badRequest(new Error(`Төлбөрийн хэлбэр буруу (${PAYMENT_METHODS.join(', ')})`))
        return
    }
    next()
}

const orderStatusMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    if (!ORDER_STATUSES.includes(req.body?.status)) {
        res.badRequest(new Error(`Төлөв буруу (${ORDER_STATUSES.join(', ')})`))
        return
    }
    next()
}

/** Худалдагч өөрийн хэсгийн төлөв: { status: 'shipped' | 'delivered' | 'cancelled' } */
const shopOrderStatusMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    if (!SHOP_ORDER_STATUSES.includes(req.body?.status)) {
        res.badRequest(new Error(`Төлөв буруу (${SHOP_ORDER_STATUSES.join(', ')})`))
        return
    }
    next()
}

/** Дэлгүүр нээх, засах: { name, city, district?, focus?, bio? } */
const shopMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const data = req.body || {}
    const isCreate = req.method === 'POST'
    if ((isCreate || data.name !== undefined) && (isBlank(data.name) || String(data.name).length > 60)) {
        res.badRequest(new Error('Дэлгүүрийн нэр оруулна уу (60 тэмдэгт хүртэл)'))
        return
    }
    if ((isCreate || data.city !== undefined) && isBlank(data.city)) {
        res.badRequest(new Error('Хот, аймгаа оруулна уу'))
        return
    }
    if (data.bio !== undefined && String(data.bio).length > 1000) {
        res.badRequest(new Error('Танилцуулга 1000 тэмдэгтээс урт байна'))
        return
    }
    next()
}

const contactMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const data = req.body || {}
    if (isBlank(data.name) || isBlank(data.contact) || isBlank(data.message)) {
        res.badRequest(new Error('Нэр, холбоо барих мэдээлэл, мессежээ бөглөнө үү!'))
        return
    }
    if (String(data.message).length > 2000) {
        res.badRequest(new Error('Мессеж 2000 тэмдэгтээс урт байна'))
        return
    }
    next()
}

export {
    validateIds,
    signupMiddleware,
    passwordMiddleware,
    categoryMiddleware,
    productMiddleware,
    orderMiddleware,
    orderStatusMiddleware,
    shopOrderStatusMiddleware,
    shopMiddleware,
    contactMiddleware
}
