import { NextFunction, Request, Response } from "express"
import notificationService from "../service/notification"
import questionCommentService from "../service/question_comment"
import answerService from "../service/answer"
import answerCommentService from "../service/answer_comment"

export const redirectNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const id = Number(req.params['id'])
    const notification = await notificationService.find(id, req.credentials.user.id, false)
    notificationService.read(id, req.credentials.user.id)
    switch (notification.object) {
      case 'question': {
        res.status(200).redirect(`/question/${notification.object_id}`)
        break
      }
      case 'question_comment': {
        const object_id: number = Number(notification.object_id)
        const questionComment = await questionCommentService.find(object_id)
        res.status(200).redirect(`/question/${questionComment.question_id}`)
        break
      }
      case 'answer': {
        const object_id: number = Number(notification.object_id)
        const answer = await answerService.find(object_id, ' ')
        res.status(200).redirect(`/question/${answer.question_id}`)
        break
      }
      case 'answer_comment': {
        const object_id: number = Number(notification.object_id)
        const answerComment = await answerCommentService.find(object_id)
        const answer = await answerService.find(answerComment.answer_id, ' ')
        res.status(200).redirect(`/question/${answer.question_id}`)
        break
      }
      case 'user': {
        res.status(200).redirect(`/user/${notification.object_id}`)
        break
      }
      default: {
        res.status(500)
        break
      }
    }
  } catch (error) {
    next(error)
  }
}

export const findNotificationCount = async (
  req: Request,
  res: Response,
  next: NextFunction
  ) => {
  try {
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const count = await notificationService.count(req.credentials.user.id, true)
    res.status(200).send(count)
  } catch (error) {
    next(error)
  }
}

export const findNotificationList = async (
  req: Request,
  res: Response,
  next: NextFunction
  ) => {
  try {
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const unreadOnly = req.query['unreadOnly'] ? Boolean(req.query['unreadOnly']) : false
    console.log(unreadOnly)
    const offset = req.query['offset'] ? Number(req.query['offset']) : 0
    res.status(200).json(await notificationService.finds(req.credentials.user.id, unreadOnly, offset))
  } catch (error) {
    next(error)
  }
}

export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const id = Number(req.params['id'])
    res.status(200).json(await notificationService.delete(id, req.credentials.user.id))
  } catch (error) {
    next(error)
  }
}