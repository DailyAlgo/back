import { NextFunction, Request, Response } from "express";

const middleware = async (err: Error,  req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  next(err)
}

export default middleware