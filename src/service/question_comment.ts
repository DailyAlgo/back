import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'
import { notify } from '../util/gen_notification'
import questionInfoService from './question_info'

export type QuestionCommentType = {
  id: number
  question_id: number
  user_id: string
  content: string
  like_cnt: number
  created_time?: Date
  modified_time?: Date
  is_scrap?: boolean
  is_like?: boolean
}

type QuestionCommentCreationType = {
  question_id: number
  user_id: string
  content: string
}

type QuestionCommentLikeType = {
  user_id: string
  comment_id: number
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

  async finds(question_id: number, myId: string): Promise<QuestionCommentType[]> {
    const sql =
      `SELECT qc.*, IF(qcl.user_id IS NULL, 'false', 'true') AS is_like
      FROM question_comment qc
      LEFT JOIN question_comment_like qcl ON qc.id = qcl.question_comment_id AND qcl.user_id = :myId
      WHERE qc.question_id = :question_id 
      ORDER BY qc.id`
    const rows = await this._findsIfExist(sql, { question_id, myId }, true)

    if (rows.length == 0) {
      throw new Error('NOT_FOUND')
    }

    return rows
  }

  async create(comment: QuestionCommentCreationType): Promise<void> {
    const sql =
    'INSERT INTO question_comment (question_id, user_id, content) VALUES (:question_id, :user_id, :content)'
    const id = await this._create(sql, {
      question_id: comment.question_id,
      user_id: comment.user_id,
      content: comment.content,
    })
    questionInfoService.renew(comment.question_id)
    notify('user', comment.user_id, 'comment', 'question_comment', String(id))
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
    const question_id = (await this.find(id)).question_id
    const sql = 'DELETE FROM question_comment WHERE id = :id AND user_id = :user_id'
    await this._delete(sql, { id, user_id })
    questionInfoService.renew(question_id)
  }

  async findLike(id: number, user_id: string): Promise<QuestionCommentLikeType> {
    const sql = 'SELECT * FROM question_comment_like WHERE question_comment_id = :id AND user_id = :user_id'
    const row = await this._findIfExist(sql, { id, user_id }, true)
    return {
      user_id: row['user_id'],
      comment_id: row['comment_id'],
    }
  }

  async like(
    id: number,
    user_id: string,
  ): Promise<void> {
    const like = await this.findLike(id, user_id)
    if (like.comment_id && like.user_id) {
      const sql1 = 'DELETE FROM question_comment_like WHERE question_comment_id = :comment_id AND user_id = :user_id'
      const sql2 = 'UPDATE question_comment SET like_cnt = like_cnt-1 WHERE id = :id'
      await this._delete(sql1, { comment_id: id, user_id })
      await this._update(sql2, { id })
    } else {
      const sql1 = 'INSERT INTO question_comment_like (question_comment_id, user_id) VALUES (:comment_id, :user_id)'
      const sql2 = 'UPDATE question_comment SET like_cnt = like_cnt+1 WHERE id = :id'
      await this._create(sql1, { comment_id: id, user_id })
      await this._update(sql2, { id })
      notify('user', user_id, 'like', 'question_comment', String(id))
    }
  }
}

export default new QuestionComment(getConfig().db)
