import { Request, Response } from 'express'
import { Types } from 'mongoose'
import logger from '@root/loaders/logger'
import { USER_ROLES } from '@root/interfaces'
import { UserService } from '@root/services'

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search, role } = req.query as { search?: string; role?: string }
        const { items, pagination } = await UserService.getUsers(req.pagination, search?.trim(), role)
        res.respondWithData(items, pagination)
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}

/** { role } */
export const changeRole = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!USER_ROLES.includes(req.body?.role)) {
            res.badRequest(new Error(`Эрх буруу (${USER_ROLES.join(', ')})`))
            return
        }
        if (String(req.user._id) === req.params.id) {
            res.badRequest(new Error('Өөрийнхөө эрхийг солих боломжгүй'))
            return
        }
        const user = await UserService.changeRole(new Types.ObjectId(req.params.id), req.body.role)
        if (!user) {
            res.documentNotFound()
            return
        }
        res.respondWithData(user)
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}

/** { blocked: 0 | 1 } */
export const setBlocked = async (req: Request, res: Response): Promise<void> => {
    try {
        const blocked = req.body?.blocked === 1 ? 1 : 0
        if (blocked && String(req.user._id) === req.params.id) {
            res.badRequest(new Error('Өөрийгөө хаах боломжгүй'))
            return
        }
        const user = await UserService.setBlocked(new Types.ObjectId(req.params.id), blocked)
        if (!user) {
            res.documentNotFound()
            return
        }
        res.respondWithData(user)
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}
