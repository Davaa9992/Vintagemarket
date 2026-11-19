import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import config from '@root/config'
import { Shop, User } from '@root/models'
import { IUser, UserRole } from '@root/interfaces'

/** Cookie (token) эсвэл Authorization: Bearer <token>-оос токен уншина */
const readToken = (req: Request): string | null => {
    const cookie = req.cookies?.token as string
    if (cookie) return cookie
    const header = req.headers.authorization
    if (header?.startsWith('Bearer ')) return header.slice(7)
    return null
}

const resolveUser = async (req: Request): Promise<IUser | null> => {
    const token = readToken(req)
    if (!token) return null
    try {
        const decoded = jwt.verify(token, config.jwt.secret) as jwt.JwtPayload
        const user = await User.findById(decoded.id)
        if (!user || !user.active || user.blocked) return null
        return user
    } catch {
        return null
    }
}

const attach = (req: Request, user: IUser | null): void => {
    req.user = user
    req.loggedIn = !!user
}

/** Нэвтэрсэн, заасан эрхийн аль нэгтэй байх шаардлагатай */
const requireRole =
    (...roles: UserRole[]) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const user = await resolveUser(req)
        if (!user) {
            res.unauthorized()
            return
        }
        if (roles.length && !roles.includes(user.role)) {
            res.resourceForbidden()
            return
        }
        attach(req, user)
        next()
    }

/** Нэвтэрсэн байх шаардлагатай (ямар ч эрх) */
const userAuth = requireRole()

/** Зөвхөн админ (бараа, захиалга удирдах) */
const adminAuth = requireRole('admin')

/** Дэлгүүртэй худалдагч (эсвэл админ). req.shop-д дэлгүүрийг ононо */
const sellerAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = await resolveUser(req)
    if (!user) {
        res.unauthorized()
        return
    }
    attach(req, user)
    const shop = await Shop.findOne({ owner_id: user._id })
    if (!shop) {
        res.resourceForbidden(new Error('Эхлээд дэлгүүрээ нээнэ үү'))
        return
    }
    if (shop.status === 'blocked') {
        res.resourceForbidden(new Error('Таны дэлгүүр хаагдсан байна'))
        return
    }
    req.shop = shop
    next()
}

/** Нэвтрээгүй ч болно; нэвтэрсэн бол req.user-г ононо */
const checkToken = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    attach(req, await resolveUser(req))
    next()
}

export { userAuth, adminAuth, sellerAuth, checkToken }
