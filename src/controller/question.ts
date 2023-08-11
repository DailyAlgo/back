import { Request, Response, NextFunction } from 'express'
import questionService from '../service/question'

export const findQuestion = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params['id']
    res.status(200).json(questionService.find(Number(id)))
  } catch (error) {
    next(error)
  }
}

export const findQuestionList = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const offset = req.params['offset'] ? Number(req.params['offset']) : 0
    res.status(200).json(questionService.findList(offset))
  } catch (error) {
    next(error)
  }
}

export const insertQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    questionService.create({
      title: req.body.title,
      user_id: req.body.user_id,
      source: req.body.source,
      type: req.body.type,
      content: req.body.content,
      code: req.body.code,
    })
    res.status(200).json({ message: 'Question created successfully' })
  } catch (error) {
    next(error)
  }
}

export const updateQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    questionService.update({
      id: req.body.id,
      title: req.body.title,
      user_id: req.body.user_id,
      source: req.body.source,
      type: req.body.type,
      content: req.body.content,
      code: req.body.code,
    })
    res.status(200).json({ message: 'Question updated successfully' })
  } catch (error) {
    next(error)
  }
}

export const deleteQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    questionService.delete(req.body.id)
    res.status(200).json({ message: 'Question deleted successfully' })
  } catch (error) {
    next(error)
  }
}