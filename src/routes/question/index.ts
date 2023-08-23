import express from 'express'
import {
  deleteQuestion,
  deleteQuestionComment,
  findQuestion,
  findQuestionCommentList,
  findQuestionList,
  getCache,
  insertQuestion,
  insertQuestionComment,
  insertQuestionTag,
  likeQuestion,
  likeQuestionComment,
  setCache,
  updateQuestion,
  updateQuestionComment,
} from '../../controller/question'
import check_token from '../../middleware/check_token'

const router = express.Router()

router.get('/cache', getCache)
router.post('/cache', setCache)

router.post('/tag', insertQuestionTag) // 신규 태그 생성
router.post('/', check_token, insertQuestion) // 질문 생성
router.get('/', findQuestionList) // 질문 리스트 조회
router.get('/:id', findQuestion) // 질문 조회
router.put('/:id', check_token, updateQuestion) // 질문 수정
router.delete('/:id', check_token, deleteQuestion) // 질문 삭제
router.put('/:id/like', check_token, likeQuestion) // 질문 좋아요
router.get('/:id/comment', findQuestionCommentList) // 댓글 조회
router.post('/:id/comment', check_token, insertQuestionComment) // 댓글 작성
router.put('/:id/comment', check_token, updateQuestionComment) // 댓글 수정
router.delete('/:id/comment', check_token, deleteQuestionComment) // 댓글 삭제
router.put('/:id/comment/like', check_token, likeQuestionComment) // 댓글 좋아요

export default router
