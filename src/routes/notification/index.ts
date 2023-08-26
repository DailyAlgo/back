import express from 'express'
import check_token from '../../middleware/check_token'
import { deleteNotification, findNotificationCount, findNotificationList, redirectNotification } from '../../controller/notification'

const router = express.Router()

router.get('/count', check_token, findNotificationCount) // 알림 확인
router.get('/', check_token, findNotificationList) // 알림 리스트 조회
router.get('/:id', check_token, redirectNotification) // 알림 이동
router.delete('/:id', check_token, deleteNotification) // 알림 삭제

export default router
