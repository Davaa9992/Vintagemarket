import { Router } from 'express'
import AsyncHandler from 'express-async-handler'
import { getShops, setShopStatus } from './shop.controller'
import { validateIds } from '@root/middlewares'

// /admin/shop — дэлгүүрүүд, нээх/түр хаах/хаах
const router = Router()

router.get('/', AsyncHandler(getShops))
router.patch('/:id/status', validateIds('id'), AsyncHandler(setShopStatus))

export default router
