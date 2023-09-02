import { NextFunction, Request, Response } from 'express'
import redis from '../service/redis'

const middleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const num = req.body.number
    const certificationNum = redis.get(req.body.id, num)
    if (num !== certificationNum) throw new Error('num is not qualified')
    res.status(200).json({ message: 'validated num' })
  } catch (error) {
    next(error)
  }
}

export default middleware
