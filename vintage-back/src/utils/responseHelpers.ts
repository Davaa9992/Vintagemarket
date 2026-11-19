import { response } from 'express'
import { Response } from 'express-serve-static-core'
import { IUser, IPagination, IShop } from '@root/interfaces'
import logger from '@root/loaders/logger'

declare module 'express-serve-static-core' {
    export interface Request {
        user?: IUser
        /** sellerAuth: нэвтэрсэн худалдагчийн дэлгүүр */
        shop?: IShop
        pagination: IPagination
        loggedIn?: boolean
    }

    export interface Response {
        respondWithData(data: unknown, pagination?: unknown): this
        respondWithError(error: Error, statusCode: number): this
        internalError(error?: Error): this
        documentNotFound(error?: Error): this
        badRequest(error?: Error): this
        unauthorized(error?: Error): this
        resourceForbidden(error?: Error): this
        routeNotFound(error?: Error): this
    }
}

/*
 * Global Response helpers
 * {status}     'success' | 'error'
 * {statusCode} 0 = амжилттай, бусад нь HTTP код
 */
response.respondWithData = function respondWithData(
    data: unknown = {},
    pagination: unknown = undefined
): Response {
    if (this.headersSent) return this
    return this.json({ data, pagination, status: 'success', statusCode: 0 })
}

const sendError = (res: Response, error: Error, statusCode: number): Response => {
    if (res.headersSent) return res
    if (statusCode >= 500) logger.error(error)
    return res.status(statusCode).json({
        error: error.name,
        message: error.message,
        status: 'error',
        statusCode
    })
}

response.respondWithError = function respondWithError(
    error: Error = new Error('Something went wrong'),
    statusCode: number
): Response {
    return sendError(this, error, statusCode)
}

response.internalError = function internalError(
    error = new Error('Серверийн алдаа [Internal Error]')
): Response {
    // Production-д дотоод алдааны мэдээллийг клиент рүү бүү гарга
    const safe =
        process.env.NODE_ENV === 'production' ? new Error('Серверийн алдаа [Internal Error]') : error
    if (safe !== error) logger.error(error)
    return sendError(this, safe, 500)
}

response.badRequest = function badRequest(error: Error = new Error('Алдаатай хүсэлт')): Response {
    return sendError(this, error, 400)
}

response.documentNotFound = function documentNotFound(
    error = new Error('Олдсонгүй [Document not found]')
): Response {
    return sendError(this, error, 404)
}

response.unauthorized = function unauthorized(
    error = new Error('Нэвтэрнэ үү [Unauthorized]')
): Response {
    return sendError(this, error, 401)
}

response.resourceForbidden = function resourceForbidden(
    error = new Error('Хориотой бүс [Forbidden]')
): Response {
    return sendError(this, error, 403)
}

response.routeNotFound = function routeNotFound(
    error = new Error('Зам олдсонгүй [Route not found]')
): Response {
    return sendError(this, error, 404)
}
