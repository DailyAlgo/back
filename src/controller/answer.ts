import { Request, Response, NextFunction } from 'express'
import answerService from '../service/answer'
import answerCommentService from '../service/answer_comment'

export const findAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const myId = req.credentials?.user?.id || ' '
    const id = Number(req.params['answer_id'])
    res.status(200).json(await answerService.find(id, myId))
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
    const myId = req.credentials?.user?.id || ' '
    const question_id = Number(req.params['question_id'])
    res.status(200).json(await answerService.finds(question_id, myId))
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
    const tags: string[] = req.body.tags
    await answerService.create({
      question_id: req.body.question_id,
      user_id: req.credentials.user.id,
      title: req.body.title,
      language: req.body.language,
      code: req.body.code,
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
    const tags: string[] = req.body.tags
    await answerService.update({
      id,
      question_id: req.body.question_id,
      user_id: req.credentials.user.id,
      title: req.body.title,
      language: req.body.language? req.body.language : '',
      code: req.body.code? req.body.code : '',
      content: req.body.content,
    }, tags)
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
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const id = Number(req.params['id'])
    const isLike = await answerService.like(id, req.credentials.user.id)
    if (isLike) {
      res.status(200).json({ message: 'Answer unliked successfully' })
    } else {
      res.status(200).json({ message: 'Answer liked successfully' })
    }
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
    const myId = req.credentials?.user?.id || ' '
    const id = Number(req.params['id'])
    res.status(200).json(await answerCommentService.finds(id, myId))
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
    const id = Number(req.params['id'])
    await answerCommentService.update({
      id,
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
    const id = Number(req.params['id'])
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
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const id = Number(req.params['id'])
    const isLike = await answerCommentService.like(id, req.credentials.user.id)
    if (isLike) {
      res.status(200).json({ message: 'Comment unliked successfully' })
    } else {
      res.status(200).json({ message: 'Comment liked successfully' })
    }
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

export const searchAnswerTag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tag = await answerService.searchTag(req.body.name)
    if (tag) {
      res.status(200).json({ message: 'Searched Tag successfully' })  
    } else {
      await answerService.createTag(req.body.name)
      res.status(200).json({ message: 'Tag created successfully' })
    }
  } catch (error) {
    next(error)
  }
}