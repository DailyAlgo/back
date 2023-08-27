import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'
import { notify } from '../util/gen_notification'

export type AnswerCommentType = {
  id: number
  answer_id: number
  user_id: string
  content: string
  like_cnt: number
  created_time?: Date
  modified_time?: Date
}

type AnswerCommentCreationType = {
  answer_id: number
  user_id: string
  content: string
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

  async finds(answer_id: number): Promise<AnswerCommentType[]> {
    const sql =
      'SELECT * FROM answer_comment WHERE answer_id = :answer_id ORDER BY id'
    const rows = await this._findsIfExist(sql, { answer_id }, true)

    if (rows.length == 0) {
      throw new Error('NOT_FOUND')
    }

    return rows
  }

  async create(comment: AnswerCommentCreationType): Promise<void> {
    const sql =
      'INSERT INTO answer_comment (answer_id, user_id, content) VALUES (:answer_id, :user_id, :content)'
    const id = await this._create(sql, {
      answer_id: comment.answer_id,
      user_id: comment.user_id,
      content: comment.content,
    })
    notify('user', comment.user_id, 'comment', 'answer_comment', String(id))
  }

  async update(comment: AnswerCommentType): Promise<void> {
    const sql = 'UPDATE answer_comment SET content = :content WHERE id = :id AND user_id = :user_id'
    await this._update(sql, {
      content: comment.content,
      id: comment.id,
      user_id: comment.user_id,
    })
  }

  async delete(id: number, user_id: string): Promise<void> {
    const sql = 'DELETE FROM answer_comment WHERE id = :id AND user_id = :user_id'
    await this._delete(sql, { id, user_id })
  }

  async like(id: number, user_id: string, type: boolean): Promise<void> {
    type ? notify('user', user_id, 'like', 'answer_comment', String(id)) : ''
    const sql = type
    ? 'UPDATE answer_comment SET like_cnt = like_cnt+1 WHERE id = :id'
    : 'UPDATE answer_comment SET like_cnt = like_cnt-1 WHERE id = :id'
    await this._update(sql, { id })
  }
}

export default new AnswerComment(getConfig().db)
