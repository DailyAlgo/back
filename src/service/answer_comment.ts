import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'
import { notify } from '../util/gen_notification'
import answerService from './answer'
import questionInfoService from './question_info'

export type AnswerCommentType = {
  id: number
  answer_id: number
  user_id: string
  content: string
  like_cnt: number
  created_time?: Date
  modified_time?: Date
  is_like?: boolean
}

export type AnswerCommentUpdateType = {
  id: number
  user_id: string
  content: string
  like_cnt: number
  created_time?: Date
  modified_time?: Date
  is_like?: boolean
}

type AnswerCommentCreationType = {
  answer_id: number
  user_id: string
  content: string
}

type AnswerCommentLikeType = {
  user_id: string
  comment_id: number
}

export class AnswerComment extends Base {
  constructor(options: PoolOptions) {
    super(options)
  }

  async find(id: number): Promise<AnswerCommentType> {
    const sql = 'SELECT * FROM answer_comment WHERE id = :id'
    const row = await this._findIfExist(sql, { id: id }, false)
    return {
      id: row['id'],
      answer_id: row['answer_id'],
      user_id: row['user_id'],
      content: row['content'],
      like_cnt: row['like_cnt'],
      created_time: row['created_time'],
      modified_time: row['modified_time'],
    }
  }

  async finds(answer_id: number, myId: string): Promise<AnswerCommentType[]> {
    const sql =
      `SELECT ac.*, IF(acl.user_id IS NULL, 'false', 'true') AS is_like
      FROM answer_comment ac
      LEFT JOIN answer_comment_like acl ON ac.id = acl.answer_comment_id AND acl.user_id = :myId
      WHERE ac.answer_id = :answer_id 
      ORDER BY ac.id`
    const rows = await this._findsIfExist(sql, { answer_id, myId }, true)

    if (rows.length == 0) {
      throw new Error('NOT_FOUND')
    }

    return rows
  }

  async create(comment: AnswerCommentCreationType): Promise<void> {
    const question_id = (await answerService.find(comment.answer_id)).question_id
    const sql =
      'INSERT INTO answer_comment (answer_id, user_id, content) VALUES (:answer_id, :user_id, :content)'
    const id = await this._create(sql, {
      answer_id: comment.answer_id,
      user_id: comment.user_id,
      content: comment.content,
    })
    questionInfoService.renew(question_id)
    notify('user', comment.user_id, 'comment', 'answer_comment', String(id))
  }

  async update(comment: AnswerCommentUpdateType): Promise<void> {
    const sql = 'UPDATE answer_comment SET content = :content WHERE id = :id AND user_id = :user_id'
    await this._update(sql, {
      content: comment.content,
      id: comment.id,
      user_id: comment.user_id,
    })
  }

  async delete(id: number, user_id: string): Promise<void> {
    const answer_id = (await this.find(id)).answer_id
    const question_id = (await answerService.find(answer_id)).question_id
    const sql = 'DELETE FROM answer_comment WHERE id = :id AND user_id = :user_id'
    await this._delete(sql, { id, user_id })
    questionInfoService.renew(question_id)
  }

  async findLike(id: number, user_id: string): Promise<AnswerCommentLikeType> {
    const sql = 'SELECT * FROM answer_comment_like WHERE answer_comment_id = :id AND user_id = :user_id'
    const row = await this._findIfExist(sql, { id, user_id }, true)
    return {
      user_id: row['user_id'],
      comment_id: row['comment_id'],
    }
  }

  async like(id: number, user_id: string): Promise<void> {
    const like = await this.findLike(id, user_id)
    if (like.user_id && like.comment_id) {
      const sql1 = 'DELETE FROM answer_comment_like WHERE answer_comment_id = :answer_comment_id AND user_id = :user_id'
      const sql2 = 'UPDATE answer_comment SET like_cnt = like_cnt-1 WHERE id = :id'
      await this._delete(sql1, { comment_id: id, user_id })
      await this._update(sql2, { id })
    } else {
      const sql1 = 'INSERT INTO answer_comment_like (answer_comment_id, user_id) VALUES (:comment_id, :user_id)'
      const sql2 = 'UPDATE answer_comment SET like_cnt = like_cnt+1 WHERE id = :id'
      await this._create(sql1, { comment_id: id, user_id })
      await this._update(sql2, { id })
      notify('user', user_id, 'like', 'answer_comment', String(id))
    }
  }
}

export default new AnswerComment(getConfig().db)
