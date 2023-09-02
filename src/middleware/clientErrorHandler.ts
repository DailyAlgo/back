import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";

const middleware = (err: Error,  req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error && err.message === 'NOT_FOUND') {
    res.status(HttpStatusCode.NotFound)
  }
  else if (req.xhr) {
    res.status(500).send({ error: 'This Request occurs an Error' })
  } else {
    next(err)
  }
}

export default middleware