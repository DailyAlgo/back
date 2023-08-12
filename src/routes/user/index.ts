import express from 'express'
import { findUser, signUp, login, googleRedirect, googleOauth, updateUser, deleteUser, changePassword, findIdByEmail } from '../../controller/user'
import check_password from '../../middleware/check_password'
import check_token from '../../middleware/check_token'
import compare_userId from '../../middleware/compare_userId'

const router = express.Router()

router.post('/sign_up', signUp)
router.post('/sign_in', check_password, login)
router.get('/:id', findUser)
router.put('/:id', check_token, compare_userId, updateUser)
router.delete('/:id', check_token, compare_userId, deleteUser)
router.get('/test/:id', check_token, findUser)
router.get('/oauth/google', googleRedirect)
router.get('/oauth/google/callback', googleOauth)
router.put('/password', check_token, compare_userId, changePassword)
router.get('/find/:email', findIdByEmail)
router.post('/password/find/id') // Todo : step1. id
router.post('/password/find/email') // Todo : step2. email -> cert_no
router.post('/password/reset') // Todo : step3. email + cert_no -> token
router.put('/passowrd/reset') // Todo : step4. token + new_password

export default router
