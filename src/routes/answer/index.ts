import express from 'express'
import check_token from '../../middleware/check_token'
import { deleteAnswer, deleteAnswerComment, findAnswerCommentList, findAnswerList, insertAnswer, insertAnswerComment, likeAnswer, likeAnswerComment, updateAnswer, updateAnswerComment } from '../../controller/answer'

const router = express.Router()

router.post('/', check_token, insertAnswer) // 답변 생성
router.get('/:question_id', findAnswerList) // 답변 리스트 조회
router.put('/:id', check_token, updateAnswer) // 답변 수정
router.delete('/:id', check_token, deleteAnswer) // 답변 삭제
router.put('/:id/like', check_token, likeAnswer) // 답변 좋아요
router.get('/:id/comment', findAnswerCommentList) // 답변 댓글 조회
router.post('/:id/comment', check_token, insertAnswerComment) // 댓글 작성
router.put('/:id/comment', check_token, updateAnswerComment) // 댓글 수정
router.delete('/:id/comment', check_token, deleteAnswerComment) // 댓글 삭제
router.put('/:id/comment/like', check_token, likeAnswerComment) // 댓글 좋아요

export default router
