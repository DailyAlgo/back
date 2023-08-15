import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'

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

  async find(id: string): Promise<AnswerCommentType> {
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
    const rows = await this._finds(sql, { answer_id })

    if (rows.length == 0) {
      throw new Error('NOT_FOUND')
    }

    return rows
  }

  async create(comment: AnswerCommentCreationType): Promise<void> {
    const sql =
      'INSERT INTO answer_comment (answer_id, user_id, content) VALUES (:answer_id, :user_id, :content)'
    await this._create(sql, {
      answer_id: comment.answer_id,
      user_id: comment.user_id,
      content: comment.content,
    })
  }

  async update(comment: AnswerCommentType): Promise<void> {
    const sql = 'UPDATE answer_comment SET content = :content WHERE id = :id'
    await this._update(sql, {
      content: comment.content,
      id: comment.id,
    })
  }

  async like(answer_comment: AnswerCommentType, type: boolean): Promise<void> {
    let sql
    if (type === true) {
      // 좋아요
      sql = 'UPDATE answer_comment SET like_cnt = like_cnt+1 WHERE id = :id'
    } else if (type === false) {
      // 좋아요 취소
      sql = 'UPDATE answer_comment SET like_cnt = like_cnt-1 WHERE id = :id'
    } else return
    await this._update(sql, {
      id: answer_comment.id,
    })
  }
}

export default new AnswerComment(getConfig().db)
