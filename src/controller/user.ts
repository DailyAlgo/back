import { Request, Response, NextFunction } from 'express'
import userService from '../service/user'
import passwordService from '../service/password'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import getConfig from '../config/config'
import {
  GoogleAuth,
  GoogleLogin,
  GoogleUserMe,
  KakaoAuth,
  KakaoLogin,
  KakaoUserMe,
} from '../util/gen_url'
import renderSignUp from '../view/render_sign_up'
import mail from '../service/mail'
import refreshTokenService from '../service/refresh_token'
import redis from '../service/redis'

const oauth = getConfig().oauth
const LOGIN_REDIRECT_URL = 'http://localhost:3000' // 개발 중
// TODO: DOTENV 분리
const secretKey = 'DA_JWT'

interface Auth {
  clientID: string | undefined
  redirectUri: string
}

export interface KAuth extends Auth {
  responseType: string
  scope: string
}

export interface GAuth extends Auth {
  responseType: string
  accessType: string
  scope: string
}

export type Authorization = 'google' | 'kakao'

export const findMySelf = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const id = req.credentials?.user.id
    if (id === null)
      return res.status(400).json({ message: 'id is null' })
    res.status(200).json(await userService.find(id, false))
  } catch (error) {
    next(error)
  }
}

export const findUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params['id']
    const result = await userService.find(id, false)
    if (req.credentials?.user) {
      result['is_following'] = await userService.findFollow(req.credentials.user.id, id)
    }
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!signUp_regex_check(req.body.id, req.body.nickname, req.body.password))
      return res.status(400).json({ message: '잘못된 형식의 입력값입니다.' })
    await userService.create({
      id: req.body.id,
      name: req.body.name,
      nickname: req.body.nickname,
      email: req.body.email,
      password: req.body.password,
      organization_code: req.body.organization_code,
    })
    const user = await userService.find(req.body.id, false)
    const token = jwt.sign(user, secretKey, {
      expiresIn: '1h',
    })
    const currentTime = new Date()
    const expiration_time = new Date(
      currentTime.getTime() + 7 * 24 * 60 * 60 * 1000
    ) // 7일 뒤
    refreshTokenService.create({
      user_id: user.id,
      token,
      expiration_time,
    })
    res
      .status(200)
      .cookie('jwt', token, { maxAge: 3600, httpOnly: true })
      .json({ message: 'User created successfully', token }) // TODO: token 삭제
      .redirect(LOGIN_REDIRECT_URL)
  } catch (error) {
    next(error)
  }
}

const signUp_regex_check = (id: string, nickname: string, password: string) => {
  // ID 체크
  const id_regex = /^(?=.*?[a-zA-Z])(?=.*?[a-z])(?=.*?[0-9]).{4,12}$/
  if (!id_regex.test(id)) return false

  // 닉네임 체크
  const nickname_regex = /^[가-힣a-zA-Z0-9]{4,12}$/
  if (!nickname_regex.test(nickname)) return false

  // 비밀번호 체크
  const password_regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&-]).{8,20}$/
  if (!password_regex.test(password)) return false

  return true;
}

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userService.find(req.body.id, false)
    const token = jwt.sign(user, secretKey, {
      expiresIn: '1h',
    })
    const currentTime = new Date()
    const expiration_time = new Date(
      currentTime.getTime() + 7 * 24 * 60 * 60 * 1000
    ) // 7일 뒤
    refreshTokenService.create({
      user_id: user.id,
      token,
      expiration_time,
    })
    userService.lastLogin(req.body.id)
    console.log(`!${user.id} LOGGED IN`)
    res
      .status(200)
      .cookie('jwt', token, { maxAge: 3600, httpOnly: true, secure: false })
      .json({ message: 'Success login', token }) // Todo: token 삭제
      .redirect(LOGIN_REDIRECT_URL)
  } catch (error) {
    next(error)
  }
}

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers['authorization'] || ''
  const bearerToken = token.slice(7)
  try {
    jwt.verify(bearerToken, 'DA_JWT')
    res.status(400).json({ message: 'Token is valid' })
  } catch (error) {
    if (error instanceof Error && error.message === 'TokenExpiredError') {
      const refresh = await refreshTokenService.find(bearerToken, true)
      const currentTime = new Date();
      if (refresh && refresh.expiration_time > currentTime) {
        const user = await userService.find(refresh.user_id, false)
        const expiration_time = new Date(currentTime.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7일 뒤
        const token = jwt.sign(
          user,
          'DA_JWT',
          {
            expiresIn: '1h',
          }
        )
        refreshTokenService.update(refresh.id, token, expiration_time)
        res.status(200).json({ message: 'Token is refreshed', token })
      }
      else {
        res.status(400).json({ message: 'Token is invalid' })
      }
    }
  }
}

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).json({ message: 'User signed up successfully' })
  } catch (error) {
    next(error)
  }
}

export const googleRedirect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("!!!!!   " + GoogleAuth(oauth.google))
    res.redirect(GoogleAuth(oauth.google))
  } catch (error) {
    next(error)
  }
}

export const kakaoRedirect = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.redirect(KakaoAuth(oauth.kakao))
  } catch (error) {
    next(error)
  }
}

// TODO: http request config 분리
const getBody = (code: string, authorization: Authorization): object => {
  const commonBody = {
    code,
    grant_type: 'authorization_code',
  }

  const authorizations = {
    kakao: {
      client_id: oauth.kakao.clientID,
      redirect_uri: oauth.kakao.redirectUri,
    },
    google: {
      client_id: oauth.google.clientID,
      client_secret: oauth.google.clientSecret,
      redirect_uri: oauth.google.redirectUri,
    },
  }

  return {
    ...commonBody,
    ...authorizations[authorization],
  }
}

const getGoogleToken = async (code: string) => {
  try {
    const token = await axios.post(GoogleLogin(), getBody(code, 'google'))
    const accessToken = token.data.access_token
    return accessToken
  } catch (err) {
    return err
  }
}

const getGoogleUserInfo = async (accessToken) => {
  try {
    const { data } = await axios.get(GoogleUserMe(), {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })
    return data
  } catch (err) {
    return err
  }
}

const generateRandomNumbers = (count: number): string => {
  const numbers: number[] = []
  for (let i = 0; i < count; i++) {
    const num = Math.floor(Math.random() * 10)
    numbers.push(num)
  }
  return numbers.join('')
}

export const googleOauth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query
    if (query && query.code) {
      // TODO: query code is string validator
      const accessToken = await getGoogleToken(query.code as string)
      const userInfo = await getGoogleUserInfo(accessToken)

      try {
        // 로그인
        const user = await userService.find('google' + userInfo.id, true)
        const token = jwt.sign(user, secretKey, {
          expiresIn: '1h',
        })
        const currentTime = new Date()
        const expiration_time = new Date(
          currentTime.getTime() + 7 * 24 * 60 * 60 * 1000
        ) // 7일 뒤
        refreshTokenService.create({
          user_id: user.id,
          token,
          expiration_time,
        })
        res
          .status(200)
          .cookie('jwt', token, { maxAge: 3600, httpOnly: true })
          .json({ message: 'Google login succeeded', token }) // TODO: token 삭제
          .redirect(LOGIN_REDIRECT_URL)
      } catch (error) {
        if (error instanceof Error && error.message === 'NOT_FOUND') {
          // 회원가입
          userService.create({
            id: 'google' + userInfo.id,
            name: userInfo.name,
            nickname: userInfo.given_name,
            email: userInfo.email,
            password: userInfo.email,
          })
          const user = {
            id: 'google' + userInfo.id,
            name: userInfo.name,
            nickname: userInfo.given_name,
            email: userInfo.email,
            created_time: userInfo.created_time,
          }
          const token = jwt.sign(user, secretKey, {
            expiresIn: '1h',
          })
          const currentTime = new Date()
          const expiration_time = new Date(
            currentTime.getTime() + 7 * 24 * 60 * 60 * 1000
          ) // 7일 뒤
          refreshTokenService.create({
            user_id: user.id,
            token,
            expiration_time,
          })
          res
            .status(200)
            .cookie('jwt', token, { maxAge: 3600, httpOnly: true })
            .json({ message: 'Google Signup succeeded', token }) // TODO: token 삭제
            .redirect(LOGIN_REDIRECT_URL)
        } else {
          next(error)
        }
      }
    } else {
      res.status(500).json({ message: 'Google oauth responses wrong value' })
    }
  } catch (error) {
    next(error)
  }
}

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const id = req.credentials.user.id
    await userService.update({
      id: id,
      nickname: req.body.nickname,
      intro: req.body.intro,
    })
    res.status(200).json({ message: 'User updated successfully' })
  } catch (error) {
    next(error)
  }
}

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const id = req.credentials.user.id
    await userService.delete(id)
    res.status(200).json({ message: 'User deleted successfully' })
  } catch (error) {
    next(error)
  }
}

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.newPassword)
      return res.status(400).json({ message: 'newPassword가 Null 값입니다.' })
    await passwordService.update(req.credentials?.user.id, req.body.newPassword)
    res.status(200).json({ message: 'Password changed successfully' })
  } catch (error) {
    next(error)
  }
}

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.email)
      return res.status(400).json({ message: 'email가 Null 값입니다.' })
    if (!req.body.num)
      return res.status(400).json({ message: 'num이 Null 값입니다.' })
    if (!req.body.newPassword)
      return res.status(400).json({ message: 'newPassword가 Null 값입니다.' })
    const certificationNum: string = await redis.get(req.body.email, true)
    if (req.body.num !== certificationNum)
      return res.status(400).send('인증번호가 일치하지 않습니다.')
    const id = await userService.findIdByEmail(req.body.email)
    await passwordService.update(id, req.body.newPassword)
    res.status(200).json({ message: 'Password changed successfully' })
  } catch (error) {
    next(error)
  }
}

const getKakaoToken = async (code: any) => {
  try {
    const token = await axios.post(KakaoLogin(), getBody(code, 'kakao'), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      timeout: 3000,
    })
    const accessToken = token.data.access_token
    return accessToken
  } catch (err) {
    return err
  }
}

const getKakaoUserInfo = async (accessToken) => {
  try {
    const { data } = await axios.get(KakaoUserMe(), {
      headers: {
        authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    })
    return data
  } catch (err) {
    return err
  }
}

export const kakaoOauth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // email: 추가항목 동의 or 권한 신청
    const query = req.query
    if (query && query.code) {
      // console.log('temp')
      const accessToken = await getKakaoToken(query.code)
      const userInfo = await getKakaoUserInfo(accessToken)
      const user = await userService.find('kakao' + userInfo.id, true)
      const kakaoAccount = {
        id: 'kakao' + userInfo.id,
        name: userInfo.kakao_account.profile['nickname'],
        nickname: userInfo.kakao_account.profile['nickname'],
        email: userInfo.kakao_account['email'],
        password: '',
      }

      if (user.id === '0') {
        userService.create(kakaoAccount)
      }
      const token = jwt.sign(kakaoAccount, secretKey, {
        expiresIn: '1h',
      })
      const currentTime = new Date()
      const expiration_time = new Date(
        currentTime.getTime() + 7 * 24 * 60 * 60 * 1000
      ) // 7일 뒤
      refreshTokenService.create({
        user_id: user.id,
        token,
        expiration_time,
      })
      res
        .status(200)
        .cookie('jwt', token, { maxAge: 3600, httpOnly: true }) // TODO: token 삭제
        .json({ message: 'Kakao login succeeded' })
      next()
    } else {
      res.status(500).json({ message: 'Google oauth responses wrong value' })
    }
    res.send('success info')
    next()
  } catch (error) {
    console.log('user error')
    next(error)
  }
}

export const checkId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = String(req.query['id'])
    if ((await userService.find(id, true)).id !== '0') {
      res.status(200).send(false)
    } else {
      res.status(200).send(true)
    }
  } catch (error) {
    next(error)
  }
}

export const checkNickname = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nickname = String(req.query['nickname'])
    if (await userService.findIdByNickname(nickname)) {
      res.status(200).send(false)
    } else {
      res.status(200).send(true)
    }
  } catch (error) {
    next(error)
  }
}

export const sendSignUpEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.email)
      return res.status(400).json({ success: false, message: 'email이 Null 값입니다.' })
    const email = req.body.email
    try {
      await userService.findIdByEmail(email)
      return res.status(400).json({ success: false, message: '중복된 email입니다.' })
    } catch (error) {
      const certificationNum = generateRandomNumbers(6)
      const html = renderSignUp({
        data: {
          token: `인증번호 : ${certificationNum}`,
        },
      })
      const message = {
        from: 'nodecrew nodecrew@naver.com',
        to: `${email}`,
        subject: '[데일리알고] 회원가입 인증번호',
        text: `인증번호 : ${certificationNum}`,
        html: html,
      }
      await mail.sendMail(message)
      await redis.set(email, certificationNum)
      
      res.send(200).json({ success: true, message: 'send mail' })
    }
  } catch (error) {
    next(error)
  }
}

export const sendFindIdEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.email)
      return res.status(400).json({ success: false, message: 'email이 Null 값입니다.' })
    const email = req.body.email
    try {
      await userService.findIdByEmail(email)

      const certificationNum = generateRandomNumbers(6)
      const html = renderSignUp({
        data: {
          token: `인증번호 : ${certificationNum}`,
        },
      })
      const message = {
        from: 'nodecrew nodecrew@naver.com',
        to: `${email}`,
        subject: '[데일리알고] ID 찾기 인증번호',
        text: `인증번호 : ${certificationNum}`,
        html: html,
      }
      await mail.sendMail(message)
      await redis.set(email, certificationNum)
      
      res.send(200).json({ success: true, message: 'send mail' })
    } catch (error) {
      return res.status(400).json({ success: false, message: '존재하지 않는 email입니다.' })
    }
  } catch (error) {
    next(error)
  }
}

export const sendPasswordResetEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.id)
      return res.status(400).json({ success: false, message: 'id가 Null 값입니다.' })
    if (!req.body.email)
      return res.status(400).json({ success: false, message: 'email이 Null 값입니다.' })
    const id = req.body.id
    const email = req.body.email
    if (await userService.findIdByEmail(email) !== id)
      return res.status(400).json({ success: false, message: 'email과 id가 일치하지 않습니다.' })

      const certificationNum = generateRandomNumbers(6)
      const html = renderSignUp({
        data: {
          token: `인증번호 : ${certificationNum}`,
        },
      })
      const message = {
        from: 'nodecrew nodecrew@naver.com',
        to: `${email}`,
        subject: '[데일리알고] 비밀번호 찾기 인증번호',
        text: `인증번호 : ${certificationNum}`,
        html: html,
      }
      await mail.sendMail(message)
      await redis.set(email, certificationNum)
      
      res.send(200).json({ success: true, message: 'send mail' })
  } catch (error) {
    next(error)
  }
}

export const followUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const follower = req.credentials.user.id
    const following = req.params['id']
    await userService.follow(follower, following)
    res.send('success follow')
  } catch (error) {
    next(error)
  }
}

// export const unfollowUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     if (!req.credentials?.user)
//       return res.status(400).json({ message: 'User Info is missing' })
//     const follower = req.credentials.user.id
//     const following = req.params['id']
//     await userService.follow(follower, following, false)
//     res.send('success unfollow')
//   } catch (error) {
//     next(error)
//   }
// }

export const findFollower = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const myId = req.credentials?.user?.id || ' '
    const targetId = req.params['id']
    res.send(await userService.findFollower(targetId, myId))
  } catch (error) {
    next(error)
  }
}

export const findFollowing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const myId = req.credentials?.user?.id || ' '
    const targetId = req.params['id']
    res.send(await userService.findFollowing(targetId, myId))
  } catch (error) {
    next(error)
  }
}

export const findQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const myId = req.credentials?.user?.id || ' '
    const id = req.params['id']
    const offset = req.query['offset'] ? Number(req.query['offset']) : 0
    res.send(await userService.findQuestion(id, offset, myId))
  } catch (error) {
    next(error)
  }
}

export const findAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const myId = req.credentials?.user?.id || ' '
    const id = req.params['id']
    const offset = req.query['offset'] ? Number(req.query['offset']) : 0
    res.send(await userService.findAnswer(id, offset, myId))
  } catch (error) {
    next(error)
  }
}

export const findScrap = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const myId = req.credentials?.user?.id || ' '
    const id = req.params['id']
    const offset = req.query['offset'] ? Number(req.query['offset']) : 0
    res.send(await userService.findScrap(id, offset, myId))
  } catch (error) {
    next(error)
  }
}

export const validateSignUpCertificationNum = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.email)
      return res.status(400).json({ message: 'email이 Null 값입니다.' })
    if (!req.body.num)
      return res.status(400).json({ message: 'num이 Null 값입니다.' })
    const email: string = req.body.email
    const num: string = req.body.num
    const certificationNum: string = await redis.get(email, true)
    res.status(200).send(num === certificationNum)
  } catch (error) {
    next(error)
  }
}

export const validateFindIdCertificationNum = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.email)
      return res.status(400).json({ message: 'email이 Null 값입니다.' })
    if (!req.body.num)
      return res.status(400).json({ message: 'num이 Null 값입니다.' })
    const email: string = req.body.email
    const num: string = req.body.num
    const certificationNum: string = await redis.get(email, true)
    if (num === certificationNum) {
      const id = await userService.findIdByEmail(email)
      res.status(200).send(id)
    } else {
      res.status(400).send('인증번호가 일치하지 않습니다.')
    }
  } catch (error) {
    next(error)
  }
}

export const validatePasswordResetCertificationNum = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.email)
      return res.status(400).json({ message: 'email이 Null 값입니다.' })
    if (!req.body.num)
      return res.status(400).json({ message: 'num이 Null 값입니다.' })
    const email: string = req.body.email
    const num: string = req.body.num
    const certificationNum: string = await redis.get(email, true)
    res.status(200).send(num === certificationNum)
  } catch (error) {
    next(error)
  }
}