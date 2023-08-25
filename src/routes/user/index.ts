import express from 'express'
import {
  findUser,
  signUp,
  login,
  googleRedirect,
  googleOauth,
  updateUser,
  deleteUser,
  changePassword,
  findIdByEmail,
  kakaoRedirect,
  kakaoOauth,
  checkId,
  checkNickname,
  sendSignUpEmail,
  followUser,
  unfollowUser,
  findFollower,
  findFollowing,
  findQuestion,
  findScrap,
  verifyUser,
  // sendChangePassword,
} from '../../controller/user'
import check_password from '../../middleware/check_password'
import check_token from '../../middleware/check_token'
import { findAnswer } from '../../controller/answer'

const router = express.Router()

// OAuth 로그인
router.get('/oauth/google', googleRedirect)
router.get('/kauth/kakao', kakaoRedirect)
router.get('/oauth/google/callback', googleOauth)
router.get('/kauth/kakao/callback', kakaoOauth)

router.get('/find/:email', findIdByEmail) // 아이디 찾기
router.post('/sign_up', signUp) // 회원가입
router.get('/check/id', checkId) // ID 중복 확인
router.get('/check/nickname', checkNickname) // 닉네임 중복확인
router.get('/email', sendSignUpEmail) // 이메일 발송 테스트
router.post('/sign_in', check_password, login) // 로그인
router.get('/:id', findUser) // 회원정보 조회
router.put('/:id', check_token, updateUser) // 회원정보 수정
router.delete('/:id', check_token, deleteUser) // 회원탈퇴
router.put('/:id/password', check_password, check_token, changePassword) // 비밀번호 변경
router.post('/:id/follow', check_token, followUser)
router.delete('/:id/follow', check_token, unfollowUser)
router.get(':id/follower', findFollower) // 팔로워 조회
router.get(':id/following', findFollowing) // 팔로잉 조회
router.get(':id/question', findQuestion) // 질문 조회
router.get(':id/answer', findAnswer) // 답변 조회
router.get(':id/scrap', findScrap) // 팔로잉 조회

// 이매일 클릭 시 사용자 인증
router.get('/authorization', check_token, verifyUser)
// 이메일 클릭 시 비밀번호 변경 주소
// (생각해보니 이건 어차피 클라이언트에서 렌더링하고 해당 폼에서 비밀번호 변경 요청 보내면 되서 불필요)
// router.get('/authorization2', check_token, sendChangePassword)

// Todo
router.get(':id/notice') // 알림 조회
router.get('/sign_up/validation') // 회원가입 인증 이메일 발송요청
router.post('/sign_up/validation') // 회원가입 이메일 인증

// Password 찾기
router.post('/password/find/id') // Todo : step1. id
router.post('/password/find/email') // Todo : step2. email -> cert_no
router.post('/password/reset') // Todo : step3. email + cert_no -> token
router.put('/passowrd/reset') // Todo : step4. token + new_password

// Email

export default router
