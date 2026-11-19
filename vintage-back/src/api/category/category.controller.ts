import { Request, Response } from 'express'
import { Types } from 'mongoose'
import logger from '@root/loaders/logger'
import { CategoryService } from '@root/services'
import { FormatHelpers } from '@root/utils'

const cleanName = (v: unknown): string => String(v ?? '').trim().replace(/\s+/g, ' ')

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
    try {
        res.respondWithData(await CategoryService.getCategories())
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}

/** { name, slug? } */
export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const name = cleanName(req.body.name)
        const slug = FormatHelpers.slugify(req.body.slug || name)
        if (!slug) {
            res.badRequest(new Error('slug буруу байна'))
            return
        }
        if (await CategoryService.findBySlug(slug)) {
            res.badRequest(new Error(`"${slug}" ангилал аль хэдийн байна`))
            return
        }
        res.respondWithData(await CategoryService.createCategory({ name, slug }))
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}

/** { name?, slug?, position? } */
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = new Types.ObjectId(req.params.id)
        const update: { name?: string; slug?: string; position?: number } = {}
        if (req.body.name !== undefined) update.name = cleanName(req.body.name)
        if (req.body.position !== undefined) update.position = req.body.position
        if (req.body.slug !== undefined) {
            update.slug = FormatHelpers.slugify(String(req.body.slug))
            if (!update.slug || (await CategoryService.findBySlug(update.slug, id))) {
                res.badRequest(new Error('slug буруу эсвэл давхцаж байна'))
                return
            }
        }
        const category = await CategoryService.updateCategory(id, update)
        if (!category) {
            res.documentNotFound(new Error('Ангилал олдсонгүй'))
            return
        }
        res.respondWithData(category)
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await CategoryService.deleteCategory(new Types.ObjectId(req.params.id))
        if (!result.deleted) {
            res.badRequest(new Error(result.reason))
            return
        }
        res.respondWithData({ status: 'success' })
    } catch (error) {
        logger.error(error)
        res.internalError(error as Error)
    }
}
