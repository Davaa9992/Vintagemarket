import { NextFunction, Request, Response } from 'express'

const MAX_LIMIT = 100

function paginate(req: Request, _res: Response, next: NextFunction): void {
    const { limit, page } = req.query as { limit?: string; page?: string }

    const l = Math.min(Math.max(parseInt(limit, 10) || 20, 1), MAX_LIMIT)
    const p = Math.max(parseInt(page, 10) || 1, 1)

    req.pagination = { limit: l, page: p, offset: l * (p - 1) }
    next()
}

export { paginate }
