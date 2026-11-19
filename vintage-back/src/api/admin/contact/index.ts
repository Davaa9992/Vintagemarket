import { Router } from 'express'
import AsyncHandler from 'express-async-handler'
import { deleteMessage, getMessages, markRead } from '../../contact/contact.controller'
import { paginate, validateIds } from '@root/middlewares'

// /admin/contact — "Холбоо барих" формоос ирсэн мессежүүд
const router = Router()

router.get('/', paginate, AsyncHandler(getMessages))
router.patch('/:id', validateIds('id'), AsyncHandler(markRead))
router.delete('/:id', validateIds('id'), AsyncHandler(deleteMessage))

export default router
