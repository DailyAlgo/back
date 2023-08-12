import { Request, Response, NextFunction } from 'express'
import userService from '../service/user'
import passwordService from '../service/password'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import getConfig from '../config/config'

const oauth = getConfig().oauth

export const findUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params['id']
    const user = await userService.find(id)
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
    userService.create({
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
    const token = jwt.sign(await userService.find(req.body.id), secretKey, {
      expiresIn: '1h',
    })
    res.status(200).json({ message: 'Success login', token })
  } catch (error) {
    next(error)
  }
}

const OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
                + `?client_id=${oauth.CLIENT_ID}`
                + `&response_type=${oauth.RESPONSE_TYPE}`
                + `&redirect_uri=${oauth.REDIRECT_URL}`
                + `&scope=${oauth.SCOPE}`
                + `&access_type=${oauth.ACCESS_TYPE}`;

export const googleRedirect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(OAUTH_URL)
    res.redirect(OAUTH_URL);
  } catch (error) {
    next(error)
  }
}

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

const getGoogleToken = async (code) => {
  try {
    const tokenApi = await axios.post(GOOGLE_TOKEN_URL, {
      code,
      client_id: oauth.CLIENT_ID,
      client_secret: oauth.CLIENT_SECRET,
      redirect_uri: oauth.REDIRECT_URL,
      grant_type: 'authorization_code'
    });
    const accessToken = tokenApi.data.access_token;
    return accessToken;
  } catch (err) {
    return err;
  }
};

const GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

const getGoogleUserInfo = async (accessToken) => {
  try {
    const userInfoApi = await axios.get(GOOGLE_USER_INFO_URL, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log(userInfoApi.data)
    return userInfoApi.data;
  } catch (err) {
    return err;
  }
};

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
      let user = await userService.find('google'+userInfo.id)

      if (user === null) {
        // 회원가입
        userService.create({
          id: 'google'+userInfo.id,
          name: userInfo.name,
          nickname: userInfo.given_name,
          email: userInfo.email,
          password: userInfo.email,
        })
        user = {
          id: 'google'+userInfo.id,
          name: userInfo.name,
          nickname: userInfo.given_name,
          email: userInfo.email,
          created_time: userInfo.created_time,
        }
      }
      const token = jwt.sign(user, secretKey, {
        expiresIn: '1h',
      })
      res.status(200).json({ message: 'Google login succeeded', token })
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
};

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
};

export const changePassword =async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    passwordService.changePassword(req.body.user_id, req.body.password)
    res.status(200).json({ message: 'Password changed successfully' })
  } catch (error) {
    next(error)
  }
}

export const findIdByEmail =async (
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