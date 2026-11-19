import { Router } from 'express'
import AsyncHandler from 'express-async-handler'
import { getShop, getShops } from './shop.controller'

// Нийтийн: дэлгүүрүүд. Барааг /product?shop=<slug>-аар авна
const router = Router()

router.get('/', AsyncHandler(getShops))
router.get('/:slug', AsyncHandler(getShop))

export default router
