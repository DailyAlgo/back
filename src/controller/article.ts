import { Request, Response, NextFunction } from 'express'
import articleService from '../service/article'

export const findArticle = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params['id']
    res.status(200).json(articleService.find(id))
  } catch (error) {
    next(error)
  }
}

export const insertArticle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    articleService.create({
      title: req.body.title,
      writer: req.body.writer,
      content: req.body.content,
    })
    res.status(200).json({ message: 'Article created successfully' })
  } catch (error) {
    next(error)
  }
}
