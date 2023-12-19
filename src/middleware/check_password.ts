import { NextFunction, Request, Response } from 'express'
import passwordService from '../service/password'

const middleware = async (req: Request, _: Response, next: NextFunction) => {
  try {
    const id = req.credentials?.user.id
    const password = req.body.password
    await passwordService.compare(id, password)
    next()
  } catch (error) {
    console.log(`!! 비밀번호 틀림`)
    next(error)
  }
}

export default middleware
