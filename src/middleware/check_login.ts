import { NextFunction, Request, Response } from 'express'

const middleware = async (req: Request, _: Response, next: NextFunction) => {
  try {
    if (!req.credentials?.user)
      throw new Error('User Info is missing')
    next()
  } catch (error) {
    next(error)
  }
}

export default middleware