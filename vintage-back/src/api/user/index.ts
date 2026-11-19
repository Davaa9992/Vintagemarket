import { Router } from 'express'
import AsyncHandler from 'express-async-handler'
import { signUp, login, logout, info, updateProfile, changePassword } from './user.controller'
import { authLimiter, passwordMiddleware, signupMiddleware, userAuth } from '@root/middlewares'

const router = Router()

router.post('/sign_up', authLimiter, signupMiddleware, AsyncHandler(signUp))
router.post('/login', authLimiter, AsyncHandler(login))
router.post('/logout', AsyncHandler(logout))
router.get('/info', userAuth, AsyncHandler(info))
router.patch('/profile', userAuth, AsyncHandler(updateProfile))
router.patch('/password', userAuth, passwordMiddleware, AsyncHandler(changePassword))

export default router
