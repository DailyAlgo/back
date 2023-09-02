import { NextFunction, Request, Response } from "express";

const middleware = (err: Error,  req: Request, res: Response, next: NextFunction) => {
  if (req.xhr) {
    res.status(500).send({ error: 'This Request occurs an Error' })
  } else {
    next(err)
  }
}

export default middleware