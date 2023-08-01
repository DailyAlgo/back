import { Request, Response, NextFunction } from 'express'
import user from '../service/user'
import * as bcrypt from 'bcrypt'

export const findUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params['id']
    res.status(200).json(user.find(id))
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
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    user.create({
      id: req.body.id,
      password: hashedPassword,
      name: req.body.name,
    })
    // TODO: 회원 가입 후 자동 로그인
    res.status(200).json({ message: 'User created successfully' })
  } catch (error) {
    next(error)
  }
}
