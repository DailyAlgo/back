import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import refreshTokenService from '../service/refresh_token'
import userService from '../service/user'

const middleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers['authorization'] || ''
    const bearerToken = token.slice(7)
    const decoded = jwt.verify(bearerToken, 'DA_JWT')
    req.credentials = {
      user: {
        id: decoded['id'],
        name: decoded['name'],
        nickname: decoded['nickname'],
        email: decoded['email'],
        created_time: decoded['created_time'],
      },
    }
    next()
  } catch (error) {
    // if (error instanceof Error && error.message === 'TokenExpiredError') {
    //   const token = req.headers['authorization'] || ''
    //   const bearerToken = token.slice(7)
    //   const refresh = await refreshTokenService.find(bearerToken, true)
    //   const currentTime = new Date();
    //   if (refresh && refresh.expiration_time > currentTime) {
    //     const user = await userService.find(refresh.user_id, false)
    //     const expiration_time = new Date(currentTime.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7일 뒤
    //     const token = jwt.sign(
    //       user,
    //       'DA_JWT',
    //       {
    //         expiresIn: '1h',
    //       }
    //     )
    //     refreshTokenService.update(refresh.id, token, expiration_time)
    //     res.cookie('jwt', token, { maxAge: 3600, httpOnly: true })
    //     next()
    //   }
    // } else {
      next(error)
    // }
  }
}

export default middleware
