import cors from 'cors'
import express, { Express, NextFunction, Request, Response } from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import config from '@root/config'
import logger from '@root/loaders/logger'
import { UPLOAD_DIR } from '@root/api/admin/upload/upload.controller'

function configureExpress(app: Express): void {
    app.use(
        morgan(config.logs.morgan, {
            stream: {
                write(text: string): void {
                    logger.info(text.trim(), 'HTTP-LOG')
                }
            }
        })
    )

    app.set('trust proxy', 1)
    app.use(cookieParser())
    app.use(
        cors({
            origin: config.corsAllowedOrigins,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        })
    )

    // Админы upload хийсэн барааны зураг (api/admin/upload). Frontend өөр порт дээр тул cross-origin зөвшөөрнө
    app.use(
        '/uploads',
        (_req: Request, res: Response, next: NextFunction): void => {
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
            res.setHeader('X-Content-Type-Options', 'nosniff')
            next()
        },
        express.static(UPLOAD_DIR, { index: false, dotfiles: 'deny', fallthrough: false })
    )

    // Зураг /admin/upload-аар урсгалаар ирдэг тул JSON жижиг байхад хангалттай
    app.use(express.json({ limit: '1mb' }))
    app.use(express.urlencoded({ extended: true }))

    app.use(helmet())
    app.use(compression())
    app.disable('etag')

    app.use((_req: Request, res: Response, next: NextFunction): void => {
        res.setTimeout(config.apiMaxTimeoutMS, () =>
            res.internalError(
                new Error('Server timeout error: CONTROLLER took too long to execute')
            )
        )
        next()
    })
}

export default configureExpress
