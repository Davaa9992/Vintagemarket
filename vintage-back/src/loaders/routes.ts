import { Express, NextFunction, Request, Response } from 'express'
import Routes from '@root/api/routes'
import config from '@root/config'
import logger from './logger'

function configureRoutes(app: Express): void {
    app.get(`/status`, (_req: Request, res: Response) => {
        res.send('API is working!')
    })
    app.head(`/status`, (_req: Request, res: Response) => {
        res.send('API is working!')
    })

    // API routes
    app.use(`${config.api.prefix}`, Routes)

    // Default response if no routes match
    app.all('*', (_req: Request, res: Response) => res.routeNotFound())

    // Catch all unhandled exceptions
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
        if (err.name === 'CastError') {
            res.badRequest(new Error('ID буруу байна'))
            return
        }
        if (err.name === 'ValidationError') {
            res.badRequest(err)
            return
        }
        if (typeof err.message === 'object') {
            err.message = JSON.stringify(err.message)
        }
        logger.error(`FATAL: ${err}`)
        res.internalError(new Error(err.message || 'Internal Server Error'))
    })
}

export default configureRoutes
