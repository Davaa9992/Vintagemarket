import { Router } from 'express'
import AsyncHandler from 'express-async-handler'
import { getCategories } from './category.controller'

// Нийтийн: ангиллуудын жагсаалт (дэлгүүрийн шүүлтүүр)
const router = Router()

router.get('/', AsyncHandler(getCategories))

export default router
