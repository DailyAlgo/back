import { NextFunction, Request, Response } from 'express'
// import userService from '../service/user'
// import bcrypt from 'bcrypt'
import passwordService from '../service/password'

const middleware = async (req: Request, _: Response, next: NextFunction) => {
  try {
    // const user = await userService.find(req.body.id)
    // bcrypt.compare(req.body.password, user.password)
    passwordService.compare(req.body.id, req.body.password)
    next()
  } catch (error) {
    next(error)
  }
}

export default middleware
