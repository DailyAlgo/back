import express from 'express'
import check_token from '../../middleware/check_token'

const router = express.Router()

router.post('/', check_token) // todo
router.get('/') // todo
router.put('/:id', check_token) // todo
router.delete('/:id', check_token) // todo
router.put('/:id/like') // todo
router.get('/:id/comment') // todo
router.post('/:id/comment') // todo
router.put('/:id/comment') // todo
router.delete('/:id/comment') // todo

export default router
