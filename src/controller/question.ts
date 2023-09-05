import { Request, Response, NextFunction } from 'express'
import questionService from '../service/question'
import questionInfoService from '../service/question_info'
import questionCommentService from '../service/question_comment'
import redisService from '../service/redis'
// import redis from '../service/redis'

export const findQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params['id'])
    // const question = await redis.getOrSet(String(id), ()=>questionService.find(id)) // Redis Memory 올려야 쓸 수 있음
    const question = await questionService.find(id)
    if (req.credentials?.user)
      question['isScrap'] = await questionService.isScrap(req.credentials.user.id, id)
    res.status(200).json(question)
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
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const tags: number[] = req.body.tags
    await questionService.create({
      title: req.body.title,
      user_id: req.credentials.user.id,
      source: req.body.source,
      link: req.body.link,
      type: req.body.type,
      content: req.body.content,
      language: req.body.language,
      code: req.body.code,
    }, tags)
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
    const tags: number[] = req.body.tags
    await questionService.update({
      id,
      title: req.body.title,
      user_id: req.credentials.user.id,
      source: req.body.source,
      link: req.body.link,
      type: req.body.type,
      content: req.body.content,
      language: req.body.language,
      code: req.body.code,
    }, tags)
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
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const id = Number(req.params['id'])
    await questionService.delete(id, req.credentials.user.id)
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
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const id = Number(req.params['id'])
    await questionInfoService.like(id, req.credentials.user.id, req.body.type)
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
    await questionCommentService.create({
      question_id: id,
      user_id: req.credentials.user.id,
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
      user_id: req.credentials.user.id,
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
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const id = Number(req.body.id)
    await questionCommentService.delete(id, req.credentials.user.id)
    res.status(200).json({ message: 'Comment deleted successfully' })
  } catch (error) {
    next(error)
  }
}

export const likeQuestionComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    await questionCommentService.like(req.body.id, req.credentials.user.id, req.body.type)
    res.status(200).json({ message: 'Comment liked successfully' })
  } catch (error) {
    next(error)
  }
}

export const insertQuestionTag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await questionService.createTag(req.body.name)
    res.status(200).json({ message: 'Tag created successfully' })
  } catch (error) {
    next(error)
  }
}

export const searchQuestionTag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tag = await questionService.searchTag(req.body.name)
    if (tag) {
      res.status(200).json({ message: 'Searched Tag successfully' })  
    } else {
      await questionService.createTag(req.body.name)
      res.status(200).json({ message: 'Tag created successfully' })
    }
  } catch (error) {
    next(error)
  }
}

export const searchQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const keyword = req.query.keyword
    const offset = req.query['offset'] ? Number(req.query['offset']) : 0
    res.status(200).json(await questionService.search(keyword as string, offset))
  } catch (error) {
    next(error)
  }
}

export const scrapQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
      const question_id = Number(req.body.id)
    await questionService.scrap(req.credentials.user.id, question_id)
    res.status(200).json({ message: 'Question scrapped successfully' })
  } catch (error) {
    next(error)
  }
}

export const unscrapQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
      const question_id = Number(req.body.id)
    await questionService.unscrap(req.credentials.user.id, question_id)
    res.status(200).json({ message: 'Question unscrapped successfully' })
  } catch (error) {
    next(error)
  }
}

export const getCache =async (
  req: Request,  
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).send(await redisService.get(req.query.key as string, true))
  } catch (error) {
    next(error)
  }
}

export const setCache =async (
  req: Request,  
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.key) {
      return res.status(400).json({ message: 'Key is missing' })
    }
    res.status(200).send(await redisService.set(req.body.key, req.body.value))
  } catch (error) {
    next(error)
  }
}