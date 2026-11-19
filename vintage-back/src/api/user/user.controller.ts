import { Request, Response, CookieOptions } from 'express'
import config from '@root/config'
import logger from '@root/loaders/logger'
import { UserService } from '@root/services'

const cookieOptions = (): CookieOptions => ({
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.secure ? 'none' : 'lax',
    maxAge: config.cookie.maxAgeMS
})

export const signUp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, full_name, phone } = req.body
        if (await UserService.existsByPhone(phone)) {
            res.badRequest(new Error('Энэ утасны дугаар бүртгэлтэй байна'))
            return
        }
        if (email && (await UserService.existsByEmail(email))) {
            res.badRequest(new Error('Энэ имэйл бүртгэлтэй байна'))
            return
        }
        const user = await UserService.createUser({
            phone,
            email: email || undefined,
            pass_hash: String(password),
            full_name: String(full_name).trim()
        })
        const token = user.generateAuthToken()
        res.cookie('token', token, cookieOptions())
        res.respondWithData({ status: 'success', token, user: await UserService.getMe(user._id) })
    } catch (error) {
        if ((error as { code?: number }).code === 11000) {
            res.badRequest(new Error('Энэ утас эсвэл имэйл бүртгэлтэй байна'))
            return
        }
        logger.error(error)
        res.internalError(error as Error)
    }
}

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        // login: утас эсвэл имэйл (хуучин клиентэд phone/email талбар ч болно)
        const { login: id, phone, email, password } = req.body as Record<string, string | undefined>
        const loginId = id || phone || email
        if (!loginId || !password) {
            res.badRequest(new Error('Утас, нууц үгээ оруулна уу'))
            return
        }
        const user = await UserService.findForLogin(String(loginId))
        if (!user || !user.active) {
            res.badRequest(new Error('Утас эсвэл нууц үг буруу байна.'))
            return
        }
        if (user.blocked) {
            res.badRequest(new Error('Таны бүртгэл түр хаагдсан байна. Дэлгүүртэй холбогдоно уу.'))
            return
        }
        if (!(await user.checkPassword(String(password)))) {
            await UserService.registerFailedLogin(user._id)
            res.badRequest(new Error('Утас эсвэл нууц үг буруу байна.'))
            return
        }
        await UserService.registerSuccessfulLogin(user._id)
        const token = user.generateAuthToken()
        res.cookie('token', token, cookieOptions())
        res.respondWithData({ status: 'success', token, user: await UserService.getMe(user._id) })
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}

export const logout = async (_req: Request, res: Response): Promise<void> => {
    res.clearCookie('token', { ...cookieOptions(), maxAge: undefined })
    res.respondWithData({ status: 'success' })
}

export const info = async (req: Request, res: Response): Promise<void> => {
    try {
        const me = await UserService.getMe(req.user._id)
        if (!me) {
            res.documentNotFound()
            return
        }
        res.respondWithData(me)
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { full_name, phone } = req.body || {}
        if (full_name !== undefined && !String(full_name).trim()) {
            res.badRequest(new Error('Овог нэрээ оруулна уу!'))
            return
        }
        await UserService.updateProfile(req.user._id, {
            full_name: full_name !== undefined ? String(full_name).trim() : undefined,
            phone: phone !== undefined ? String(phone).trim() : undefined
        })
        res.respondWithData(await UserService.getMe(req.user._id))
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}

export const changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { oldPassword, newPassword } = req.body
        const user = await UserService.findForLogin(req.user.phone)
        if (!(await user.checkPassword(String(oldPassword || '')))) {
            res.badRequest(new Error('Хуучин нууц үг буруу байна'))
            return
        }
        await UserService.changePassword(req.user._id, String(newPassword))
        res.respondWithData({ status: 'success' })
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}
