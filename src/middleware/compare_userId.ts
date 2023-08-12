import { NextFunction, Request, Response } from 'express'

const middleware = async (req: Request, _: Response, next: NextFunction) => {
  try {
    const id = req.body.user_id || req.params['user_id'] || req.body.id || req.params['id']
    if (req.credentials?.user?.id === id) {
      next()
    } else {
      new Error('ID is not matched. (An abnormal access)')
    }
  } catch (error) {
    next(error)
  }
}

export default middleware