import { Router } from 'express'
import UserRouter from './user'
import CategoryRouter from './category'
import ProductRouter from './product'
import OrderRouter from './order'
import ContactRouter from './contact'
import ShopRouter from './shop'
import SellerRouter from './seller'
import AdminRouter from './admin'
import { adminAuth } from '@root/middlewares'

const router = Router()

router.use('/user', UserRouter)
router.use('/category', CategoryRouter) // ангиллууд (нийтийн)
router.use('/product', ProductRouter) // дэлгүүрийн бараа (нийтийн)
router.use('/shop', ShopRouter) // дэлгүүрүүд (нийтийн)
router.use('/seller', SellerRouter) // худалдагчийн самбар
router.use('/order', OrderRouter) // захиалга өгөх, шалгах
router.use('/contact', ContactRouter) // холбоо барих форм
router.use('/admin', adminAuth, AdminRouter)

export default router
