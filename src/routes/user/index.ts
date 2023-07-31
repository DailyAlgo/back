import express from 'express'
import { getUserById } from '../../controller/user'

const router = express.Router()

router.get('/:id', getUserById)

export default router
