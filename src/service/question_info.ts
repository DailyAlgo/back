import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'

export type QuestionInfoType = {
  question_id: number
  view_cnt: number
  like_cnt: number
  answer_cnt: number
  comment_cnt: number
  last_answer_id?: string
}

export class QuestionInfo extends Base {
  constructor(options: PoolOptions) {
    super(options)
  }

  async find(question_id: string): Promise<QuestionInfoType> {
    const sql = 'SELECT * FROM question_info WHERE question_id = :question_id'
    const row = await this._find(sql, { question_id })
    return {
      question_id: row['question_id'],
      view_cnt: row['view_cnt'],
      like_cnt: row['like_cnt'],
      answer_cnt: row['answer_cnt'],
      comment_cnt: row['comment_cnt'],
      last_answer_id: row['last_answer_id'],
    }
  }

  async create(question_id: number): Promise<void> {
    const sql =
      'INSERT INTO question_info (question_id) VALUES (:question_id)'
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

  async like(question_id: number, type: number): Promise<void> {
    let sql
    if (type === 1) {
      // 좋아요
      sql =
      'UPDATE question_info SET like_cnt = like_cnt+1 WHERE question_id = :question_id'
    }
    else if (type === 2) {
      // 좋아요 취소
      sql =
      'UPDATE question_info SET like_cnt = like_cnt-1 WHERE question_id = :question_id'
    }
    else return;
    await this._update(sql, {
      question_id,
    })
  }
}

export default new QuestionInfo(getConfig().db)
