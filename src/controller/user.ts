import { Request, Response, NextFunction } from 'express'
import userService from '../service/user'
import * as bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const findUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params['id']
    res.status(200).json(userService.find(id))
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
    userService.create({
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

// TODO: DOTENV 분리
const secretKey = 'DA_JWT'

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = jwt.sign(await userService.find(req.body.id), secretKey, {
      expiresIn: '1h',
    })
    res.status(200).json({ message: 'Success login', token })
  } catch (error) {
    next(error)
  }
}
