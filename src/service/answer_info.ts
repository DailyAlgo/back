import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'

export type AnswerInfoType = {
  answer_id: number
  like_cnt: number
}

export class AnswerInfo extends Base {
  constructor(options: PoolOptions) {
    super(options)
  }

  async find(answer_id: string): Promise<AnswerInfoType> {
    const sql = 'SELECT * FROM answer_info WHERE answer_id = :answer_id'
    const row = await this._find(sql, { answer_id })
    return {
      answer_id: row['answer_id'],
      like_cnt: row['like_cnt'],
    }
  }

  async create(answer_id: number): Promise<void> {
    const sql =
      'INSERT INTO answer_info (answer_id, like_cnt VALUES (:answer_id, :like_cnt)'
    await this._create(sql, {
      answer_id,
      like_cnt: 0,
    })
  }

  async update(answer_info: AnswerInfoType): Promise<void> {
    const sql =
      'UPDATE answer_info SET like_cnt = :like_cnt WHERE answer_id = :answer_id'
    await this._update(sql, {
      like_cnt: answer_info.like_cnt,
      answer_id: answer_info.answer_id,
    })
  }
}

export default new AnswerInfo(getConfig().db)
