import { Router } from 'express'
import AsyncHandler from 'express-async-handler'
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from '../../product/product.controller'
import { paginate, productMiddleware, validateIds } from '@root/middlewares'

// /admin/product — бүх бараа (нийтлэгдээгүй, зарагдсан ч орно), нэмэх, засах, устгах
const router = Router()

router.get('/', paginate, AsyncHandler(getProducts))
router.get('/:idOrSlug', AsyncHandler(getProduct))
router.post('/', productMiddleware, AsyncHandler(createProduct))
router.patch('/:id', validateIds('id'), productMiddleware, AsyncHandler(updateProduct))
router.delete('/:id', validateIds('id'), AsyncHandler(deleteProduct))

export default router
