import express from 'express'
import { deleteQuestion, findQuestion, findQuestionList, insertQuestion, updateQuestion } from '../../controller/question'
import check_token from '../../middleware/check_token'

const router = express.Router()

router.post('/', check_token, insertQuestion)
router.get('/', findQuestionList)
router.get('/:id', findQuestion)
router.put('/:id', check_token, updateQuestion)
router.delete('/:id', check_token, deleteQuestion)

export default router