import { NextFunction, Request, Response } from "express";

const middleware = (err: Error,  req: Request, res: Response, next: NextFunction) => {
  res.status(500)
  res.render('error', { error: err })
}

export default middleware