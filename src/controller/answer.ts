import { Request, Response, NextFunction } from 'express'
import answerService from '../service/answer'
import answerCommentService from '../service/answer_comment'

export const findAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params['id'])
    res.status(200).json(await answerService.find(id))
  } catch (error) {
    next(error)
  }
}

export const findAnswerList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const question_id = Number(req.params['question_id'])
    res.status(200).json(await answerService.finds(question_id))
  } catch (error) {
    next(error)
  }
}

export const insertAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const tags: number[] = req.body.tags
    await answerService.create({
      question_id: req.body.question_id,
      user_id: req.credentials.user.id,
      content: req.body.content,
    }, tags)
    res.status(200).json({ message: 'Answer created successfully' })
  } catch (error) {
    next(error)
  }
}

export const updateAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const id = Number(req.params['id'])
    await answerService.update({
      id,
      question_id: req.body.question_id,
      user_id: req.credentials.user.id,
      content: req.body.content,
      tags: req.body.tags,
    })
    res.status(200).json({ message: 'Answer updated successfully' })
  } catch (error) {
    next(error)
  }
}

export const deleteAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const id = Number(req.params['id'])
    await answerService.delete(id, req.credentials.user.id)
    res.status(200).json({ message: 'Answer deleted successfully' })
  } catch (error) {
    next(error)
  }
}

export const likeAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await answerService.like(req.body.id, req.body.type)
    res.status(200).json({ message: 'Answer liked successfully' })
  } catch (error) {
    next(error)
  }
}

export const findAnswerCommentList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params['id'])
    res.status(200).json(await answerCommentService.finds(id))
  } catch (error) {
    next(error)
  }
}

export const insertAnswerComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const id = Number(req.params['id'])
    await answerCommentService.create({
      answer_id: id,
      user_id: req.credentials.user.id,
      content: req.body.content,
    })
    res.status(200).json({ message: 'Comment created successfully' })
  } catch (error) {
    next(error)
  }
}

export const updateAnswerComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const id = Number(req.body.id)
    const answer_id = Number(req.params['id'])
    await answerCommentService.update({
      id,
      answer_id,
      user_id: req.credentials.user.id,
      content: req.body.content,
      like_cnt: -1,
    })
    res.status(200).json({ message: 'Comment updated successfully' })
  } catch (error) {
    next(error)
  }
}

export const deleteAnswerComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const id = Number(req.body.id)
    await answerCommentService.delete(id, req.credentials.user.id)
    res.status(200).json({ message: 'Comment deleted successfully' })
  } catch (error) {
    next(error)
  }
}

export const likeAnswerComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await answerCommentService.like(req.body.id, req.body.type)
    res.status(200).json({ message: 'Comment liked successfully' })
  } catch (error) {
    next(error)
  }
}

export const insertAnswerTag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await answerService.createTag(req.body.name)
    res.status(200).json({ message: 'Tag created successfully' })
  } catch (error) {
    next(error)
  }
}