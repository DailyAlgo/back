import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'
import { notify } from '../util/gen_notification'

export type QuestionInfoType = {
  question_id: number
  view_cnt: number
  like_cnt: number
  answer_cnt: number
  comment_cnt: number
}

export class QuestionInfo extends Base {
  constructor(options: PoolOptions) {
    super(options)
  }

  async find(question_id: string): Promise<QuestionInfoType> {
    const sql = 'SELECT * FROM question_info WHERE question_id = :question_id'
    const row = await this._findIfExist(sql, { question_id }, false)
    return {
      question_id: row['question_id'],
      view_cnt: row['view_cnt'],
      like_cnt: row['like_cnt'],
      answer_cnt: row['answer_cnt'],
      comment_cnt: row['comment_cnt'],
    }
  }

  async create(question_id: number): Promise<void> {
    const sql = 'INSERT INTO question_info (question_id) VALUES (:question_id)'
    await this._create(sql, {
      question_id,
    })
  }

  async update(question_info: QuestionInfoType): Promise<void> {
    const sql =
      'UPDATE question_info SET view_cnt = :view_cnt, like_cnt = :like_cnt, answer_cnt = :answer_cnt, comment_cnt = :comment_cnt WHERE question_id = :question_id'
    await this._update(sql, {
      view_cnt: question_info.view_cnt,
      like_cnt: question_info.like_cnt,
      answer_cnt: question_info.answer_cnt,
      comment_cnt: question_info.comment_cnt,
      question_id: question_info.question_id,
    })
  }

  async view(question_id: number): Promise<void> {
    const sql =
      'UPDATE question_info SET view_cnt = view_cnt+1 WHERE question_id = :question_id'
    await this._update(sql, {
      question_id,
    })
  }

  async like(question_id: number, user_id: string, type: boolean): Promise<void> {
    type ? notify('user', user_id, 'like', 'question', String(question_id)) : ''
    const sql = type 
    ? `UPDATE question_info qi 
      INNER JOIN question q ON qi.question_id = q.id 
      SET qi.like_cnt = qi.like_cnt+1 
      WHERE qi.question_id = :question_id
      AND q.user_id = :user_id`
    : `UPDATE question_info qi 
      INNER JOIN question q ON qi.question_id = q.id 
      SET qi.like_cnt = qi.like_cnt-1 
      WHERE qi.question_id = :question_id AND qi.like_cnt > 0
      AND q.user_id = :user_id`
    await this._update(sql, {
      question_id, user_id
    })
  }
}

export default new QuestionInfo(getConfig().db)
