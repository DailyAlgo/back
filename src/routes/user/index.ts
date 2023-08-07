import express from 'express'
import { findUser, signUp, login } from '../../controller/user'
import check_password from '../../middleware/check_password'
import check_token from '../../middleware/check_token'

const router = express.Router()

router.post('/sign_up', signUp)
router.post('/sign_in', check_password, login)
router.get('/:id', findUser)
router.get('/test/:id', check_token, findUser)

export default router
