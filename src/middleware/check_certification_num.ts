import { NextFunction, Request, Response } from 'express'
import redis from '../service/redis'

const middleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const num: string = req.body.num
    const certificationNum: string = await redis.get(req.body.id, true)
    if (num !== certificationNum) throw new Error('num is not qualified')
    next()
  } catch (error) {
    next(error)
  }
}

export default middleware
