import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'
import { notify } from '../util/gen_notification'

interface AnswerType {
  id: number
  question_id: number
  user_id: string
  content: string
  created_time?: Date
  modified_time?: Date
  tags: string[]  
}

interface AnswerInfo extends AnswerType {
  id: number
  question_id: number
  user_id: string
  content: string
  like_cnt: number
  created_time?: Date
  modified_time?: Date
  tags: string[]
}

type AnswerCreationType = {
  question_id: number
  user_id: string
  content: string
}

export class Answer extends Base {
  constructor(options: PoolOptions) {
    super(options)
  }

  async find(id: number): Promise<AnswerInfo> {
    const sql = 'SELECT * FROM answer WHERE id = :id'
    const row = await this._findIfExist(sql, { id: id }, false)
    const tags = await this.findTag(row['id'])
    return {
      id: row['id'],
      question_id: row['question_id'],
      user_id: row['user_id'],
      content: row['content'],
      like_cnt: row['like_cnt'],
      created_time: row['created_time'],
      modified_time: row['modified_time'],
      tags,
    }
  }

  async finds(question_id: number): Promise<AnswerInfo[]> {
    const sql =
      'SELECT * FROM answer WHERE question_id = :question_id ORDER BY id'
    const rows = await this._findsIfExist(sql, { question_id }, true)
    return Promise.all(rows.map(row=>{
      const tags = this.findTag(row['id'])
      return {...row, tags}
    }))
  }

  async create(answer: AnswerCreationType, tags: number[]): Promise<void> {
    const created_time = Date.now()
    const sql =
    'INSERT INTO answer (question_id, user_id, content, like_cnt, created_time) VALUES (:question_id, :user_id, :content, :created_time)'
    const answer_id = await this._create(sql, {
      question_id: answer.question_id,
      user_id: answer.user_id,
      content: answer.content,
      created_time: created_time,
    })
    notify('user', answer.user_id, 'answer', 'answer', String(answer_id))
    tags.forEach(tag => {
      this.addTag(tag, answer_id)
    })
  }

  async update(answer: AnswerType): Promise<void> {
    const sql =
      'UPDATE answer SET content = :content, like_cnt = :like_cnt WHERE id = :id AND user_id = :user_id'
    await this._update(sql, {
      content: answer.content,
      id: answer.id,
      user_id: answer.user_id,
      tags: answer.tags,
    })
  }

  async delete(id: number, user_id: string): Promise<void> {
    const sql = 'DELETE FROM answer WHERE id = :id AND user_id = :user_id'
    await this._delete(sql, { id, user_id })
  }

  async like(id: number, user_id: string, type: boolean): Promise<void> {
    type ? notify('user', user_id, 'like', 'answer', String(id)) : ''
    const sql = type
    ? 'UPDATE answer SET like_cnt = like_cnt+1 WHERE id = :id AND user_id = :user_id'
    : 'UPDATE answer SET like_cnt = like_cnt-1 WHERE id = :id AND user_id = :user_id'
    await this._update(sql, { id, user_id })
  }

  async createTag(name: string): Promise<void> {
    const sql = 'INSERT INTO answer_tag (name) VALUES (:name)'
    await this._create(sql, { name, })
  }

  async addTag(tag_id: number, answer_id: number): Promise<void> {
    const sql = 'INSERT INTO answer_tag_map (tag_id, answer_id) VALUES (:tag_id, :answer_id)'
    await this._create(sql, {
      tag_id,
      answer_id,
    })
  }

  async findTag(answer_id: number): Promise<string[]> {
    const sql = 
    `SELECT at.name 
    FROM answer_tag at 
    INNER JOIN answer_tag_map atm ON at.id = atm.tag_id
    WHERE atm.answer_id = :answer_id`
    const rows = await this._findsIfExist(sql, { answer_id }, true)
    return rows
  }
}

export default new Answer(getConfig().db)
