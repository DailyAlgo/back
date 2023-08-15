import { NextFunction, Request, Response } from 'express'
import passwordService from '../service/password'

const middleware = async (req: Request, _: Response, next: NextFunction) => {
  try {
    await passwordService.compare(req.body.id, req.body.password)
    next()
  } catch (error) {
    next(error)
  }
}

export default middleware
