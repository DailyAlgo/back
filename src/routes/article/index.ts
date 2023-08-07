import express from 'express'
import { findArticle, insertArticle } from '../../controller/article'
import check_token from '../../middleware/check_token'

const router = express.Router()

router.post('/', insertArticle)
router.get('/:id', findArticle)
router.get('/test/:id', check_token, findArticle)
// TODO: update, delete

export default router
