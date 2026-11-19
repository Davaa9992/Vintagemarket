import { Router } from 'express'
import AsyncHandler from 'express-async-handler'
import { getOrder, getOrders, getSummary, updateOrderStatus } from '../../order/order.controller'
import { orderStatusMiddleware, paginate, validateIds } from '@root/middlewares'

// /admin/order — захиалгууд, төлөв солих, борлуулалтын тойм
const router = Router()

router.get('/', paginate, AsyncHandler(getOrders))
router.get('/summary', AsyncHandler(getSummary))
router.get('/:id', validateIds('id'), AsyncHandler(getOrder))
router.patch('/:id/status', validateIds('id'), orderStatusMiddleware, AsyncHandler(updateOrderStatus))

export default router
