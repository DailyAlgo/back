import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'

export type AnswerType = {
  id: number
  question_id: number
  user_id: string
  content: string
  like_cnt: number
  created_time: Date
  modified_time?: Date
}

type AnswerCreationType = {
  id?: number
  question_id: number
  user_id: string
  content: string
}

export class Answer extends Base {
  constructor(options: PoolOptions) {
    super(options)
  }

  async find(id: string): Promise<AnswerType> {
    const sql = 'SELECT * FROM answer WHERE id = :id'
    const row = await this._find(sql, { id: id })
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

  async findList(
    question_id: number,
  ): Promise<AnswerType[]> {
    const sql = 'SELECT * FROM answer WHERE question_id = :question_id ORDER BY id'
    const rows = await this._findListAll(sql, { question_id })

    if (rows.length == 0) {
      throw new Error('NOT_FOUND')
    }

    return rows
  }

  async create(answer: AnswerCreationType): Promise<void> {
    const created_time = Date.now();
    const sql =
      'INSERT INTO answer (question_id, user_id, content, like_cnt, created_time) VALUES (:question_id, :user_id, :content, :created_time)'
    await this._create(sql, {
      question_id: answer.question_id,
      user_id: answer.user_id,
      content: answer.content,
      created_time: created_time,
    })
  }

  async update(answer: AnswerCreationType): Promise<void> {
    if (!answer.id) return
    
    const modified_time = Date.now();
    const sql =
      'UPDATE answer SET content = :content, like_cnt = :like_cnt, modified_time = :modified_time WHERE id = :id'
    await this._update(sql, {
      content: answer.content,
      modified_time,
      id: answer.id
    })
  }

  async like(answer: AnswerType): Promise<number> {
    const like_cnt = answer.like_cnt + 1
    const sql =
    'UPDATE answer SET like_cnt = :like_cnt WHERE id = :id'
    await this._update(sql, {
      like_cnt,
      id: answer.id
    })
    return like_cnt
  }
}

export default new Answer(getConfig().db)
