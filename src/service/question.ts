import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'
import question_info from './question_info'

export type QuestionType = {
  id: number
  title: string
  user_id: string
  source: string
  link: string
  type: string
  content: string
  code: string
  created_time?: Date
  modified_time?: Date
  tags: string[]
}

type QuestionCreationType = {
  title: string
  user_id: string
  source: string
  link: string
  type: string
  content: string
  code: string
}

type QuestionListType = {
  id: string
  title: string
  source: string
  type: string
  view_cnt: number
  like_cnt: number
  answer_cnt: number
  comment_cnt: number
  tags: string[]
  user_id: string
  created_time: Date
}

type QuestionDetailType = {
  id: number
  title: string
  user_id: string
  user_nickname: string
  source: string
  link: string
  type: string
  content: string
  code: string
  created_time: Date
  modified_time?: Date
  view_cnt: number
  like_cnt: number
  answer_cnt: number
  comment_cnt: number
  tags: string[]
}

export class Question extends Base {
  constructor(options: PoolOptions) {
    super(options)
  }

  async find(id: number): Promise<QuestionDetailType> {
    question_info.view(id)
    const sql =
      `SELECT q.*, qi.*, u.nickname 
      FROM question q 
      INNER JOIN question_info qi ON q.id = qi.question_id 
      INNER JOIN user u ON q.user_id = u.id 
      WHERE q.id = :id`
    const row = await this._findIfExist(sql, { id: id }, false)
    const tags = await this.findTag(row['id'])
    return {
      id: row['id'],
      title: row['title'],
      user_id: row['user_id'],
      user_nickname: row['nickname'],
      source: row['source'],
      link: row['link'],
      type: row['type'],
      content: row['content'],
      code: row['code'],
      created_time: row['created_time'],
      modified_time: row['modified_time'],
      view_cnt: row['view_cnt'],
      like_cnt: row['like_cnt'],
      answer_cnt: row['answer_cnt'],
      comment_cnt: row['comment_cnt'],
      tags,
    }
  }

  async finds(offset: number): Promise<QuestionListType[]> {
    const limit = 10
    const sql =
      `SELECT q.id, q.title, q.source, q.type, qi.view_cnt, qi.like_cnt, qi.answer_cnt, qi.comment_cnt, q.user_id, q.created_time 
      FROM question q 
      INNER JOIN question_info qi ON q.id = qi.question_id 
      LIMIT :limit OFFSET :offset`
    const rows = await this._findsIfExist(sql, { offset, limit }, true)
    return Promise.all(rows.map(row=>{
      const tags = this.findTag(row['id'])
      row = {...row, tags}
    }))
  }

  async create(question: QuestionCreationType, tags: number[]): Promise<void> {
    const sql =
      'INSERT INTO question (title, user_id, source, link, type, content, code) VALUES (:title, :user_id, :source, :link, :type, :content, :code)'
    const question_id = await this._create(sql, {
      title: question.title,
      user_id: question.user_id,
      source: question.source,
      link: question.link,
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
      'UPDATE question SET title = :title, source = :source, link = :link, type = :type, content = :content, code = :code WHERE id = :id AND user_id = :user_id'
    await this._update(sql, {
      title: question.title,
      source: question.source,
      link: question.link,
      type: question.type,
      content: question.content,
      code: question.code,
      id: question.id,
      user_id: question.user_id,
      tags: question.tags,
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

  async addTag(tag_name: number, question_id: number): Promise<void> {
    const sql = `INSERT INTO question_tag_map 
    (tag_id, question_id) 
    (
      SELECT max(id), :question_id
      FROM question_tag
      WHERE name = :tag_name
    )`
    await this._create(sql, {
      tag_name,
      question_id,
    })
  }

  async findTag(question_id: number): Promise<string[]> {
    const sql = 
    `SELECT qt.name 
    FROM question_tag qt 
    INNER JOIN question_tag_map qtm ON qt.id = qtm.tag_id
    WHERE qtm.question_id = :question_id`
    const rows = await this._findsIfExist(sql, { question_id }, true)
    return rows
  }

  async searchTag(name: string): Promise<string[]> {
    const sql = 
    `SELECT name 
    FROM question_tag 
    WHERE name = :name`
    const rows = await this._findsIfExist(sql, { name }, true)
    return rows
  }

  async search(keyword: string, offset: number): Promise<QuestionListType[]> {
    const limit = 10
    keyword = '%'+keyword.trim()+'%'
    const sql = 
      `SELECT q.id, q.title, q.source, q.type, qi.view_cnt, qi.like_cnt, qi.answer_cnt, qi.comment_cnt, q.user_id, q.created_time 
      FROM question q 
      INNER JOIN question_info qi ON q.id = qi.question_id 
      WHERE q.title LIKE :keyword
      LIMIT :limit OFFSET :offset`
    const rows = await this._findsIfExist(sql, { keyword, limit, offset }, true)
    return Promise.all(rows.map(row=>{
      const tags = this.findTag(row['id'])
      return {...row, tags}
    }))
  }

  async scrap(user_id: string, question_id: number): Promise<void> {
    const sql = 'INSERT INTO scrap (user_id, question_id) VALUES (:user_id, :question_id)'
    await this._create(sql, { user_id, question_id, })
  }

  async unscrap(user_id: string, question_id: number): Promise<void> {
    const sql = 'DELETE FROM scrap WHERE user_id = :user_id AND question_id = :question_id'
    await this._delete(sql, { user_id, question_id, })
  }

  async isScrap(user_id: string, question_id: number): Promise<boolean> {
    const sql = 'SELECT * FROM scrap WHERE user_id = :user_id AND question_id = :question_id'
    const scrap = await this._findIfExist(sql, { user_id, question_id, }, true)
    if (scrap < 0) {
      return false
    }
    return true
  }
}

export default new Question(getConfig().db)
