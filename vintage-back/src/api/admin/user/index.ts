import { Router } from 'express'
import AsyncHandler from 'express-async-handler'
import { changeRole, getUsers, setBlocked } from './user.controller'
import { paginate, validateIds } from '@root/middlewares'

const router = Router()

router.get('/', paginate, AsyncHandler(getUsers))
router.patch('/:id/role', validateIds('id'), AsyncHandler(changeRole))
router.patch('/:id/block', validateIds('id'), AsyncHandler(setBlocked))

export default router
