import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'

export type QuestionCommentType = {
  id: number
  question_id: number
  user_id: string
  content: string
  like_cnt: number
  created_time?: Date
  modified_time?: Date
}

type QuestionCommentCreationType = {
  question_id: number
  user_id: string
  content: string
}

export class QuestionComment extends Base {
  constructor(options: PoolOptions) {
    super(options)
  }

  async find(id: number): Promise<QuestionCommentType> {
    const sql = 'SELECT * FROM question_comment WHERE id = :id'
    const row = await this._findIfExist(sql, { id: id }, false)
    return {
      id: row['id'],
      question_id: row['question_id'],
      user_id: row['user_id'],
      content: row['content'],
      like_cnt: row['like_cnt'],
      created_time: row['created_time'],
      modified_time: row['modified_time'],
    }
  }

  async finds(question_id: number): Promise<QuestionCommentType[]> {
    const sql =
      'SELECT * FROM question_comment WHERE question_id = :question_id ORDER BY id'
    const rows = await this._findsIfExist(sql, { question_id }, true)

    if (rows.length == 0) {
      throw new Error('NOT_FOUND')
    }

    return rows
  }

  async create(comment: QuestionCommentCreationType): Promise<void> {
    const sql =
      'INSERT INTO question_comment (question_id, user_id, content) VALUES (:question_id, :user_id, :content)'
    await this._create(sql, {
      question_id: comment.question_id,
      user_id: comment.user_id,
      content: comment.content,
    })
  }

  async update(comment: QuestionCommentType): Promise<void> {
    const sql = 'UPDATE question_comment SET content = :content WHERE id = :id AND user_id = :user_id'
    await this._update(sql, {
      content: comment.content,
      id: comment.id,
      user_id: comment.user_id,
    })
  }

  async delete(id: number, user_id: string): Promise<void> {
    const sql = 'DELETE FROM question_comment WHERE id = :id AND user_id = :user_id'
    await this._delete(sql, { id, user_id })
  }

  async like(
    id: number,
    type: boolean
  ): Promise<void> {
    let sql
    if (type === true) {
      // 좋아요
      sql = 'UPDATE question_comment SET like_cnt = like_cnt+1 WHERE id = :id'
    } else if (type === false) {
      // 좋아요 취소
      sql = 'UPDATE question_comment SET like_cnt = like_cnt-1 WHERE id = :id'
    } else return
    await this._update(sql, { id })
  }
}

export default new QuestionComment(getConfig().db)
