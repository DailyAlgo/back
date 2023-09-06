import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'

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
    next()
  }
}

export default middleware