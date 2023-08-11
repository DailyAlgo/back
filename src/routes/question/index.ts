import express from 'express'
import { findQuestion, findQuestionList, insertQuestion } from '../../controller/question'
import check_token from '../../middleware/check_token'

const router = express.Router()

router.post('/', check_token, insertQuestion)
router.get('/', findQuestionList)
router.get('/:id', findQuestion)

export default router