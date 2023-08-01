import express from 'express'
import { findUser, signUp } from '../../controller/user'

const router = express.Router()

router.post('/signup', signUp)
router.get('/:id', findUser)

export default router
