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

const oauth = getConfig().oauth

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

export const findUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params['id']
    const user = await userService.find(id, false)
    res.status(200).json(user)
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
    await userService.create({
      id: req.body.id,
      name: req.body.name,
      nickname: req.body.nickname,
      email: req.body.email,
      password: req.body.password,
    })
    // TODO: 회원 가입 후 자동 로그인
    res.status(200).json({ message: 'User created successfully' })
  } catch (error) {
    next(error)
  }
}

// TODO: DOTENV 분리
const secretKey = 'DA_JWT'

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = jwt.sign(
      await userService.find(req.body.id, false),
      secretKey,
      {
        expiresIn: '1h',
      }
    )
    res.status(200).json({ message: 'Success login', token })
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
        res.status(200).json({ message: 'Google login succeeded', token })
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
          res.status(200).json({ message: 'Google Signup succeeded', token })
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
    const id = req.params['id']
    await userService.update({
      id: id,
      nickname: req.body.nickname,
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
    const id = req.params['id']
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
    await passwordService.update(req.credentials?.user.id, req.body.newPassword)
    res.status(200).json({ message: 'Password changed successfully' })
  } catch (error) {
    next(error)
  }
}

export const findIdByEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.params['email']
    res.status(200).json(await userService.findIdByEmail(email))
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
      res.status(200).json({ message: 'Kakao login succeeded', token })
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
    if (!req.query || !req.query.id) {
      return res.status(400).json({ message: 'Email is missing' })
    }
    const id = String(req.query['id'])
    if (await userService.find(id, true)) {
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
    if (!req.query || !req.query.nickname) {
      return res.status(400).json({ message: 'Nickname is missing' })
    }
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