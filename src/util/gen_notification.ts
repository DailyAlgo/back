

import notificationService from "../service/notification"
import questionService from "../service/question"
import answerService from "../service/answer"
import questionCommentService from "../service/question_comment"
import answerCommentService from "../service/answer_comment"
import userService from "../service/user"
import organizationService from "../service/organization"

export const notify = async (
  subject: string,
  subject_id: string,
  type: string,
  object: string,
  object_id: string,
) => {
  let user_id
  let subject_name
  let object_name
  let content
  switch (subject) {
    case 'user': {
      const user = await userService.find(subject_id, false)
      subject_name = user.nickname
      break
    }
    default: {
      break
    }
  }

  switch (object) {
    case 'question': {
      const id = Number(object_id)
      const question = await questionService.find(id)
      object_name = question.title
      user_id = question.user_id
      break
    }
    case 'question_comment': {
      const id = Number(object_id)
      const question_comment = await questionCommentService.find(id)
      const question = await questionService.find(question_comment.question_id)
      object_name = question.title
      user_id = question.user_id
      if (type === 'comment') {
        content = question_comment.content
      }
      break
    }
    case 'answer': {
      const id = Number(object_id)
      const answer = await answerService.find(id)
      const question = await questionService.find(answer.question_id)
      object_name = question.title
      user_id = question.user_id
      if (type === 'answer') {
        content = answer.content
      }
      break
    }
    case 'answer_comment': {
      const id = Number(object_id)
      const answer_comment = await answerCommentService.find(id)
      const answer = await answerService.find(answer_comment.answer_id)
      const question = await questionService.find(answer.question_id)
      object_name = question.title
      user_id = answer.user_id
      if (type === 'comment') {
        content = answer_comment.content
      }
      break
    }
    case 'user': {
      const user = await userService.find(object_id, false)
      object_name = user.nickname
      user_id = user.id
      if (type === 'follow') {
        user_id = object_id
      }
      break
    }
    case 'organization': {
      const id = Number(object_id)
      const organization = await organizationService.findById(id, false)
      object_name = organization.name
      user_id = organization.master
      break
    }
    default: {
      break
    }
  }
  await notificationService.create({
    user_id,
    type,
    subject,
    subject_id,
    subject_name,
    object,
    object_id,
    object_name,
    content
  })
}