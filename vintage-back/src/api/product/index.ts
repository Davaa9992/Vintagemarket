import { Router } from 'express'
import AsyncHandler from 'express-async-handler'
import { getProduct, getProducts } from './product.controller'
import { checkToken, paginate } from '@root/middlewares'

// Нийтийн: дэлгүүрийн бараа (нийтлэгдсэн, зарагдаагүй)
const router = Router()

router.get('/', checkToken, paginate, AsyncHandler(getProducts))
router.get('/:idOrSlug', checkToken, AsyncHandler(getProduct))

export default router
