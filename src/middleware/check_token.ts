import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const middleware = async (req: Request, _: Response, next: NextFunction) => {
  try {
    const token = req.headers['authorization'] || ''
    const bearerToken = token.slice(7)
    const decoded = jwt.verify(bearerToken, 'DA_JWT')
    req.credentials && {
      user: {
        id: decoded['id'],
        password: decoded['password'],
        name: decoded['name'],
      },
    }
    next()
  } catch (error) {
    next(error)
  }
}

export default middleware
