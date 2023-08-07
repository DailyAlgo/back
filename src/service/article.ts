import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'

export type ArticleType = {
  id?: string
  title: string
  content: string
  writer: string
  view_cnt?: string
  created_date?: Date
}

export class Article extends Base {
  constructor(options: PoolOptions) {
    super(options)
  }

  async find(id: string): Promise<ArticleType> {
    const sql = 'SELECT * FROM board WHERE id = :id'
    const row = await this._find(sql, { id: id })
    return {
      id: row['id'],
      title: row['title'],
      content: row['content'],
      writer: row['writer'],
      view_cnt: row['view_cnt'],
      created_date: row['created_date'],
    }
  }

  async create(article: ArticleType): Promise<void> {
    const sql =
      'INSERT INTO board (title, writer, content) VALUES (:title, :writer, :content)'
    await this._create(sql, {
      title: article.title,
      writer: article.writer,
      content: article.content,
    })
  }
}

export default new Article(getConfig().db)
