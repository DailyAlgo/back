import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'

export type QuestionType = {
  id: number
  title: string
  writer: string
  source: string
  type: number
  content: string
  code: string
  created_time: Date
  modified_time?: Date
}

export class Question extends Base {
  constructor(options: PoolOptions) {
    super(options)
  }

  async find(id: string): Promise<QuestionType> {
    const sql = 'SELECT * FROM board WHERE id = :id'
    const row = await this._find(sql, { id: id })
    return {
      id: row['id'],
      title: row['title'],
      writer: row['writer'],
      source: row['source'],
      type: row['type'],
      content: row['content'],
      code: row['code'],
      created_time: row['created_time'],
      modified_time: row['modified_time'],
    }
  }

  async create(question: QuestionType): Promise<void> {
    const sql =
      'INSERT INTO board (title, writer, source, type, content, code, created_time, modified_time VALUES (:title, :writer, :source, :type, :content, :code, :created_time, :modified_time)'
    await this._create(sql, {
      title: question.title,
      writer: question.writer,
      source: question.source,
      type: question.type,
      content: question.content,
      code: question.code,
      created_time: question.created_time,
    })
  }
}

export default new Question(getConfig().db)
