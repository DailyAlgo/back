import express from 'express'
import find from './find'

const router = express.Router()

router.get('/:id', find)

export default router
