import { Router } from 'express'
import AsyncHandler from 'express-async-handler'
import { uploadFile } from './upload.controller'

const router = Router()

// Биеийг дискэнд урсгалаар бичнэ. POST /admin/upload/image?name=jacket.jpg (body: файлын агуулга)
router.post('/image', AsyncHandler(uploadFile('images')))

export default router
