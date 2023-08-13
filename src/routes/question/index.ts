import express from 'express'
import { deleteQuestion, findQuestion, findQuestionList, insertQuestion, updateQuestion } from '../../controller/question'
import check_token from '../../middleware/check_token'
import compare_userId from '../../middleware/compare_userId'

const router = express.Router()

router.post('/', check_token, insertQuestion)
router.get('/', findQuestionList)
router.get('/:id', findQuestion)
router.put('/:id', check_token, compare_userId, updateQuestion)
router.delete('/:id', check_token, compare_userId, deleteQuestion)
router.put('/:id/like') // todo
router.get('/:id/comment') // todo
router.post('/:id/comment') // todo
router.put('/:id/comment') // todo
router.delete('/:id/comment') // todo

export default router