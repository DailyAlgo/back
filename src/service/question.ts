import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'

export type QuestionType = {
  id: number
  title: string
  user_id: string
  source: string
  type: number
  content: string
  code: string
  created_time: Date
  modified_time?: Date
}

type QuestionCreationType = {
  id: number
  title: string
  user_id: string
  source: string
  type: number
  content: string
  code: string
}

export class Question extends Base {
  constructor(options: PoolOptions) {
    super(options)
  }

  async find(id: string): Promise<QuestionType> {
    const sql = 'SELECT * FROM question WHERE id = :id'
    const row = await this._find(sql, { id: id })
    return {
      id: row['id'],
      title: row['title'],
      user_id: row['user_id'],
      source: row['source'],
      type: row['type'],
      content: row['content'],
      code: row['code'],
      created_time: row['created_time'],
      modified_time: row['modified_time'],
    }
  }

  async findList(
    offset: number,
    limit: number
  ): Promise<QuestionType[]> {
    const sql = 'SELECT * FROM question ORDERS LIMIT :limit OFFSET :offset'
    const rows = await this._findListPage(sql, { offset, limit })

    if (rows.length == 0) {
      throw new Error('NOT_FOUND')
    }

    return rows
  }

  async create(question: QuestionCreationType): Promise<void> {
    const created_time = Date.now();
    const sql =
      'INSERT INTO question (title, user_id, source, type, content, code, created_time) VALUES (:title, :user_id, :source, :type, :content, :code, :created_time)'
    await this._create(sql, {
      title: question.title,
      user_id: question.user_id,
      source: question.source,
      type: question.type,
      content: question.content,
      code: question.code,
      created_time,
    })
  }

  async update(question: QuestionCreationType): Promise<void> {
    const modified_time = Date.now();
    const sql =
      'UPDATE question SET title = :title, source = :source, type = :type, content = :content, code = :code, modified_time = :modified_time WHERE id = :id'
    await this._update(sql, {
      title: question.title,
      source: question.source,
      type: question.type,
      content: question.content,
      modified_time,
      id: question.id,
    })
  }
}

export default new Question(getConfig().db)
