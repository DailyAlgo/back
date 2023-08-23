import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'
import question_info from './question_info'

export type QuestionType = {
  id: number
  title: string
  user_id: string
  source: string
  type: number
  content: string
  code: string
  created_time?: Date
  modified_time?: Date
}

type QuestionCreationType = {
  title: string
  user_id: string
  source: string
  type: number
  content: string
  code: string
}

type QuestionListType = {
  title: string
  view_cnt: number
  like_cnt: number
  answer_cnt: number
  comment_cnt: number
}

type QuestionDetailType = {
  id: number
  title: string
  user_id: string
  source: string
  type: number
  content: string
  code: string
  created_time: Date
  modified_time?: Date
  view_cnt: number
  like_cnt: number
  answer_cnt: number
  comment_cnt: number
}

export class Question extends Base {
  constructor(options: PoolOptions) {
    super(options)
  }

  async find(id: number): Promise<QuestionDetailType> {
    question_info.view(id)
    const sql =
      'SELECT q.*, qi.* FROM question q INNER JOIN question_info qi ON q.id = qi.question_id WHERE id = :id'
    const row = await this._findIfExist(sql, { id: id }, false)
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
      view_cnt: row['view_cnt'],
      like_cnt: row['like_cnt'],
      answer_cnt: row['answer_cnt'],
      comment_cnt: row['comment_cnt'],
    }
  }

  async finds(offset: number): Promise<QuestionListType[]> {
    const limit = 10
    const sql =
      'SELECT q.id, q.title, qi.view_cnt, qi.like_cnt, qi.answer_cnt, qi.comment_cnt FROM question q INNER JOIN question_info qi ON q.id = qi.question_id LIMIT :limit OFFSET :offset'
    const rows = await this._findsIfExist(sql, { offset, limit }, true)
    return rows
  }

  async create(question: QuestionCreationType, tags: number[]): Promise<void> {
    const sql =
      'INSERT INTO question (title, user_id, source, type, content, code) VALUES (:title, :user_id, :source, :type, :content, :code)'
    const question_id = await this._create(sql, {
      title: question.title,
      user_id: question.user_id,
      source: question.source,
      type: question.type,
      content: question.content,
      code: question.code,
    })
    question_info.create(question_id)
    tags.forEach(tag => {
      this.addTag(tag, question_id)
    })
  }

  async update(question: QuestionType): Promise<void> {
    const sql =
      'UPDATE question SET title = :title, source = :source, type = :type, content = :content, code = :code WHERE id = :id AND user_id = :user_id'
    await this._update(sql, {
      title: question.title,
      source: question.source,
      type: question.type,
      content: question.content,
      code: question.code,
      id: question.id,
      user_id: question.user_id,
    })
  }

  async delete(id: number, user_id: string): Promise<void> {
    const sql = 'DELETE FROM question WHERE id = :id AND user_id = :user_id'
    await this._delete(sql, {
      id,
      user_id,
    })
  }

  async createTag(name: string): Promise<void> {
    const sql = 'INSERT INTO question_tag (name) VALUES (:name)'
    await this._create(sql, { name, })
  }

  async addTag(tag_id: number, question_id: number): Promise<void> {
    const sql = 'INSERT INTO question_tag_map (tag_id, question_id) VALUES (:tag_id, :question_id)'
    await this._create(sql, {
      tag_id,
      question_id,
    })
  }
}

export default new Question(getConfig().db)
