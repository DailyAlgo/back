import { Request, Response, NextFunction } from 'express'
import questionService from '../service/question'
import questionInfoService from '../service/question_info'
import questionCommentService from '../service/question_comment'

export const findQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params['id'])
    res.status(200).json(await questionService.find(id))
  } catch (error) {
    next(error)
  }
}

export const findQuestionList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const offset = req.query['offset'] ? Number(req.query['offset']) : 0
    res.status(200).json(await questionService.finds(offset))
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
      user_id: req.credentials?.user?.id,
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
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const id = Number(req.params['id'])
    questionService.update({
      id,
      title: req.body.title,
      user_id: req.credentials?.user?.id,
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
    const id = Number(req.params['id'])
    questionService.delete(id)
    res.status(200).json({ message: 'Question deleted successfully' })
  } catch (error) {
    next(error)
  }
}

export const likeQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params['id'])
    await questionInfoService.like(id, req.body.type)
    res.status(200).json({ message: 'Question liked successfully' })
  } catch (error) {
    next(error)
  }
}

export const findQuestionCommentList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params['id'])
    res.status(200).json(await questionCommentService.finds(id))
  } catch (error) {
    next(error)
  }
}

export const insertQuestionComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const id = Number(req.params['id'])
    questionCommentService.create({
      question_id: id,
      user_id: req.credentials?.user?.id,
      content: req.body.content,
    })
    res.status(200).json({ message: 'Comment created successfully' })
  } catch (error) {
    next(error)
  }
}

export const updateQuestionComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const id = Number(req.body.id)
    const question_id = Number(req.params['id'])
    await questionCommentService.update({
      id,
      question_id,
      user_id: req.credentials?.user?.id,
      content: req.body.content,
      like_cnt: -1,
    })
    res.status(200).json({ message: 'Comment updated successfully' })
  } catch (error) {
    next(error)
  }
}

export const deleteQuestionComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.body.id)
    await questionCommentService.delete(id)
    res.status(200).json({ message: 'Comment deleted successfully' })
  } catch (error) {
    next(error)
  }
}
