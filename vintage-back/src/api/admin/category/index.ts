import { Router } from 'express'
import AsyncHandler from 'express-async-handler'
import { createCategory, deleteCategory, getCategories, updateCategory } from '../../category/category.controller'
import { categoryMiddleware, validateIds } from '@root/middlewares'

// /admin/category — ангилал нэмэх, засах, устгах
const router = Router()

router.get('/', AsyncHandler(getCategories))
router.post('/', categoryMiddleware, AsyncHandler(createCategory))
router.patch('/:id', validateIds('id'), categoryMiddleware, AsyncHandler(updateCategory))
router.delete('/:id', validateIds('id'), AsyncHandler(deleteCategory))

export default router
