import express from 'express'
import { findUser, signUp, login, googleRedirect, googleOauth, updateUser, deleteUser, changePassword, findIdByEmail } from '../../controller/user'
import check_password from '../../middleware/check_password'
import check_token from '../../middleware/check_token'
import compare_userId from '../../middleware/compare_userId'

const router = express.Router()

router.post('/sign_up', signUp) // 회원가입
router.post('/sign_in', check_password, login) // 로그인
router.get('/:id', findUser) // 회원정보 조회
router.put('/:id', check_token, compare_userId, updateUser) // 회원정보 수정
router.delete('/:id', check_token, compare_userId, deleteUser) // 회원탈퇴
router.put('/:id/password', check_password, check_token, compare_userId, changePassword) // 비밀번호 변경
// Todo
router.get('/question') // 내 질문 조회
router.get('/answer') // 내 답변 조회
router.get('/notice') // 알림 조회
// Google 로그인
router.get('/oauth/google', googleRedirect)
router.get('/oauth/google/callback', googleOauth)
router.get('/find/:email', findIdByEmail) // 아이디 찾기
// Password 찾기
router.post('/password/find/id') // Todo : step1. id
router.post('/password/find/email') // Todo : step2. email -> cert_no
router.post('/password/reset') // Todo : step3. email + cert_no -> token
router.put('/passowrd/reset') // Todo : step4. token + new_password

export default router
