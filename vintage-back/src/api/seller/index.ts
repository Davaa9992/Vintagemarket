import { Router } from 'express'
import AsyncHandler from 'express-async-handler'
import {
    createMyProduct,
    createShop,
    deleteMyProduct,
    getMyOrders,
    getMyProduct,
    getMyProducts,
    getMyShop,
    getMySummary,
    updateMyOrderStatus,
    updateMyProduct,
    updateMyShop
} from './seller.controller'
import { uploadFile } from '../admin/upload/upload.controller'
import {
    paginate,
    productMiddleware,
    sellerAuth,
    shopMiddleware,
    shopOrderStatusMiddleware,
    userAuth,
    validateIds
} from '@root/middlewares'

// /seller — худалдагчийн самбар. Дэлгүүр нээхээс бусад нь sellerAuth (req.shop)
const router = Router()

router.post('/shop', userAuth, shopMiddleware, AsyncHandler(createShop))
router.get('/shop', sellerAuth, AsyncHandler(getMyShop))
router.patch('/shop', sellerAuth, shopMiddleware, AsyncHandler(updateMyShop))

router.get('/summary', sellerAuth, AsyncHandler(getMySummary))

router.get('/product', sellerAuth, paginate, AsyncHandler(getMyProducts))
router.get('/product/:id', sellerAuth, validateIds('id'), AsyncHandler(getMyProduct))
router.post('/product', sellerAuth, productMiddleware, AsyncHandler(createMyProduct))
router.patch('/product/:id', sellerAuth, validateIds('id'), productMiddleware, AsyncHandler(updateMyProduct))
router.delete('/product/:id', sellerAuth, validateIds('id'), AsyncHandler(deleteMyProduct))

router.get('/order', sellerAuth, paginate, AsyncHandler(getMyOrders))
router.patch('/order/:id/status', sellerAuth, validateIds('id'), shopOrderStatusMiddleware, AsyncHandler(updateMyOrderStatus))

// Барааны зураг: POST /seller/upload/image?name=jacket.jpg (body: файлын агуулга)
router.post('/upload/image', sellerAuth, AsyncHandler(uploadFile('images')))

export default router
