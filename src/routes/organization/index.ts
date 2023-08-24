import express from 'express'
import check_token from '../../middleware/check_token'
import { deleteOrganization, findOrganization, insertOrganizatioon, joinOrganization, withdrawOrganization } from '../../controller/organization'

const router = express.Router()

router.post('/', check_token, insertOrganizatioon) // 조직 생성
router.get('/code', findOrganization) // 조직 조회
router.delete('/:id', check_token, deleteOrganization) // 조직 삭제
router.post('/:id/join', check_token, joinOrganization) // 가입
router.delete('/:id/withdraw', check_token, withdrawOrganization) // 탈퇴

export default router
