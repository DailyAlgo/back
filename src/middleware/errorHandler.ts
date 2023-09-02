import { NextFunction, Request, Response } from 'express'

const middleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(500).send({ message: err })
}

export default middleware
