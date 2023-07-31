import { Request, Response, NextFunction } from 'express'
import user from '../../service/user'

const handler = (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params['id']
    res.status(200).json(user.find(id))
  } catch (error) {
    next(error)
  }
}

export default handler
