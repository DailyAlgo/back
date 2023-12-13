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
  findMySelf,
  sendFindIdEmail,
  validateSignUpCertificationNum,
  validateFindIdCertificationNum,
  sendPasswordResetEmail,
  validatePasswordResetCertificationNum,
  resetPassword
} from '../../controller/user'
import check_password from '../../middleware/check_password'
import check_token from '../../middleware/check_token'
import check_certification_num from '../../middleware/check_certification_num'
import { findAnswer } from '../../controller/answer'

const router = express.Router()

// OAuth 로그인
router.get('/oauth/google', googleRedirect)
router.get('/kauth/kakao', kakaoRedirect)
router.get('/oauth/google/callback', googleOauth)
router.get('/kauth/kakao/callback', kakaoOauth)

router.get('/check/id', checkId) // ID 중복 확인
router.get('/check/nickname', checkNickname) // 닉네임 중복확인
router.post('/sign_up/email', sendSignUpEmail) // 6자리 난수 인증번호 메일로 전송
router.post('/sign_up/validate', validateSignUpCertificationNum) // 인증번호 확인
router.post('/sign_up', check_certification_num, signUp) // 회원가입

router.post('/find/email', sendFindIdEmail) // 6자리 난수 인증번호 메일로 전송
router.post('/find/validate', validateFindIdCertificationNum) // 아이디 찾기

router.post('/password/reset/email', sendPasswordResetEmail) // step1 : 6자리 난수 인증번호 메일로 전송
router.post('/password/reset/validate', validatePasswordResetCertificationNum) // step2 : 인증번호 확인
router.put('/password/reset', resetPassword) // step3 : 새로운 비밀번호 입력

router.post('/sign_in', check_password, login) // 로그인
router.get('/', check_token, findMySelf) // 본인정보 조회
router.get('/:id', findUser) // 회원정보 조회
router.put('/', check_token, updateUser) // 회원정보 수정
router.delete('/', check_token, deleteUser) // 회원탈퇴
router.put('/password', check_password, check_token, changePassword) // 비밀번호 변경
router.post('/:id/follow', check_token, followUser)
router.delete('/:id/follow', check_token, unfollowUser)
router.get('/:id/follower', findFollower) // 팔로워 조회
router.get('/:id/following', findFollowing) // 팔로잉 조회
router.get('/:id/question', findQuestion) // 질문 조회
router.get('/:id/answer', findAnswer) // 답변 조회
router.get('/:id/scrap', findScrap) // 팔로잉 조회

// 이매일 클릭 시 사용자 인증
router.get('/authorization', check_token, verifyUser)
// 이메일 클릭 시 비밀번호 변경 주소
// (생각해보니 이건 어차피 클라이언트에서 렌더링하고 해당 폼에서 비밀번호 변경 요청 보내면 되서 불필요)
// router.get('/authorization2', check_token, sendChangePassword)

export default router
