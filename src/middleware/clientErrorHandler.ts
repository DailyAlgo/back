import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";

const middleware = (err: Error,  req: Request, res: Response, next: NextFunction) => {
  if (err.message === 'NOT_FOUND') {
    res.status(HttpStatusCode.NotFound).json({ message: err.message })
  }
  else if (err.message === 'BAD_REQUEST') {
    res.status(HttpStatusCode.BadRequest).json({ message: err.message })
  }
  else if (req.xhr) {
    res.status(500).json({ message: 'XMLHttpRequest occurs an Error' })
  } else {
    next(err)
  }
}

export default middleware