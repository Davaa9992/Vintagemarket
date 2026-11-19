import { Router } from 'express'
import AsyncHandler from 'express-async-handler'
import { createOrder, myOrders, trackOrder } from './order.controller'
import { checkToken, orderMiddleware, paginate, submitLimiter, userAuth } from '@root/middlewares'

const router = Router()

// Нэвтрээгүй ч захиалга өгч болно (нэвтэрсэн бол хэрэглэгчтэй холбогдоно)
router.post('/', submitLimiter, checkToken, orderMiddleware, AsyncHandler(createOrder))
router.get('/track', submitLimiter, AsyncHandler(trackOrder))
router.get('/my', userAuth, paginate, AsyncHandler(myOrders))

export default router
