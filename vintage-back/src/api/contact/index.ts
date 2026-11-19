import { Router } from 'express'
import AsyncHandler from 'express-async-handler'
import { sendMessage } from './contact.controller'
import { contactMiddleware, submitLimiter } from '@root/middlewares'

const router = Router()

router.post('/', submitLimiter, contactMiddleware, AsyncHandler(sendMessage))

export default router
