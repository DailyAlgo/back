import express from 'express'
import check_token from '../../middleware/check_token'
import check_token_existence from '../../middleware/check_token_existence'
import { deleteAnswer, deleteAnswerComment, findAnswer, findAnswerCommentList, findAnswerList, insertAnswer, insertAnswerComment, insertAnswerTag, likeAnswer, likeAnswerComment, searchAnswerTag, updateAnswer, updateAnswerComment } from '../../controller/answer'

const router = express.Router()

router.post('/tag', insertAnswerTag) // 신규 태그 생성
router.get('/tag', searchAnswerTag) // 태그 조회 (없으면 생성)
router.post('/', check_token, insertAnswer) // 답변 생성
router.get('/detail/:question_id', check_token_existence, findAnswer) // 답변 리스트 조회
router.get('/:question_id', check_token_existence, findAnswerList) // 답변 리스트 조회
router.put('/:id', check_token, updateAnswer) // 답변 수정
router.delete('/:id', check_token, deleteAnswer) // 답변 삭제
router.put('/:id/like', check_token, likeAnswer) // 답변 좋아요
router.get('/:id/comment', check_token_existence, findAnswerCommentList) // 답변 댓글 조회
router.post('/:id/comment', check_token, insertAnswerComment) // 댓글 작성
router.put('/comment/:id', check_token, updateAnswerComment) // 댓글 수정
router.delete('/comment/:id', check_token, deleteAnswerComment) // 댓글 삭제
router.put('/comment/:id/like', check_token, likeAnswerComment) // 댓글 좋아요

export default router
