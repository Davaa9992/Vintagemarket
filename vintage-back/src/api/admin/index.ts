import { Router } from 'express'
import ProductRouter from './product'
import CategoryRouter from './category'
import OrderRouter from './order'
import ContactRouter from './contact'
import UserRouter from './user'
import UploadRouter from './upload'
import ShopRouter from './shop'

// Бүх зам adminAuth-аар хамгаалагдсан (api/routes.ts)
const router = Router()

router.use('/product', ProductRouter)
router.use('/category', CategoryRouter)
router.use('/order', OrderRouter)
router.use('/contact', ContactRouter)
router.use('/user', UserRouter)
router.use('/upload', UploadRouter)
router.use('/shop', ShopRouter)

export default router
