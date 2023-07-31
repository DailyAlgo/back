import { Request, Response, NextFunction } from 'express'
import user from '../service/user'

export const getUserById = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params['id']
    res.status(200).json(user.find(id))
  } catch (error) {
    next(error)
  }
}
