import { Request, Response, NextFunction } from 'express'
import userService from '../service/user'
import passwordService from '../service/password'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import getConfig from '../config/config'

const oauth = getConfig().oauth
const kauth = getConfig().kauth

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

const OAUTH_URL =
  'https://accounts.google.com/o/oauth2/v2/auth' +
  `?client_id=${oauth.GOOGLE_CLIENT_ID}` +
  `&response_type=${oauth.GOOGLE_RESPONSE_TYPE}` +
  `&redirect_uri=${oauth.GOOGLE_REDIRECT_URL}` +
  `&scope=${oauth.GOOGLE_SCOPE}` +
  `&access_type=${oauth.GOOGLE_ACCESS_TYPE}`

export const googleRedirect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(OAUTH_URL)
    res.redirect(OAUTH_URL)
  } catch (error) {
    next(error)
  }
}

const KAUTH_URL =
  'https://kauth.kakao.com/oauth/authorize' +
  `?client_id=${kauth.CLIENT_ID}` +
  `&response_type=${kauth.RESPONSE_TYPE}` +
  `&redirect_uri=${kauth.REDIRECT_URL}` +
  `&scope=${kauth.SCOPE}`

export const kakaoRedirect = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.redirect(KAUTH_URL)
  } catch (error) {
    next(error)
  }
}

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

const getGoogleToken = async (code) => {
  try {
    const tokenApi = await axios.post(GOOGLE_TOKEN_URL, {
      code,
      client_id: oauth.GOOGLE_CLIENT_ID,
      client_secret: oauth.GOOGLE_CLIENT_SECRET,
      redirect_uri: oauth.GOOGLE_REDIRECT_URL,
      grant_type: 'authorization_code',
    })
    const accessToken = tokenApi.data.access_token
    return accessToken
  } catch (err) {
    return err
  }
}

const GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

const getGoogleUserInfo = async (accessToken) => {
  try {
    const userInfoApi = await axios.get(GOOGLE_USER_INFO_URL, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })
    console.log(userInfoApi.data)
    return userInfoApi.data
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
      const accessToken = await getGoogleToken(query.code)
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
    userService.update({
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
    userService.delete(id)
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
  if (!req.credentials?.user)
    return res.status(400).json({ message: 'User Info is missing' })
  try {
    await passwordService.changePassword(
      req.credentials.user.id,
      req.body.newPassword
    )
    res.status(200).json({ message: 'Password changed successfully' })
  } catch (error) {
    next(error)
  }
}
const KAKAO_TOKEN_URL = 'https://kauth.kakao.com/oauth/token'

export const findIdByEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.params['email']
    res.status(200).json(userService.findIdByEmail(email))
  } catch (error) {
    next(error)
  }
}

const getKakaoToken = async (code: any) => {
  try {
    console.log('get kakao token')
    const tokenApi = await axios.post(
      KAKAO_TOKEN_URL,
      {
        grant_type: 'authorization_code',
        client_id: kauth.CLIENT_ID,
        redirect_uri: kauth.REDIRECT_URL,
        code,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        timeout: 3000,
      }
    )
    const accessToken = tokenApi.data.access_token
    return accessToken
  } catch (err) {
    return err
  }
}

const KAKAO_USER_INFO_URL = 'https://kapi.kakao.com/v2/user/me'

const getKakaoUserInfo = async (accessToken) => {
  try {
    const userInfoApi = await axios.get(KAKAO_USER_INFO_URL, {
      headers: {
        authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    })
    console.log(userInfoApi.data)
    return userInfoApi.data
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
