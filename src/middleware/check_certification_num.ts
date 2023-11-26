import { NextFunction, Request, Response } from 'express'
import redis from '../service/redis'

const middleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.num)
      return res.status(400).json({ message: 'num이 Null 값입니다.' })
    if (!req.body.email)
      return res.status(400).json({ message: 'email이 Null 값입니다.' })
    const num: string = req.body.num
    const certificationNum: string = await redis.get(req.body.email, true)
    if (num !== certificationNum) throw new Error('num is not qualified')
    next()
  } catch (error) {
    next(error)
  }
}

export default middleware
