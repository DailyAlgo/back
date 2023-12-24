import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'
import { notify } from '../util/gen_notification'
import questionInfoService from './question_info'

interface AnswerType {
  id: number
  question_id: number
  title: string
  user_id: string
  language: string
  code: string
  content: string
  created_time?: Date
  modified_time?: Date
}

type AnswerCreationType = {
  question_id: number
  title: string
  user_id: string
  language: string
  code: string
  content: string
}

interface AnswerInfo extends AnswerType {
  id: number
  question_id: number
  title: string
  user_id: string
  language: string
  code: string
  content: string
  like_cnt: number
  created_time?: Date
  modified_time?: Date
  tags: string[]
  is_like?: boolean
}

type AnswerLikeType = {
  user_id: string
  answer_id: number
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
      title: row['title'],
      user_id: row['user_id'],
      language: row['language'],
      code: row['code'],
      content: row['content'],
      like_cnt: row['like_cnt'],
      created_time: row['created_time'],
      modified_time: row['modified_time'],
      tags,
    }
  }

  async finds(question_id: number, myId: string): Promise<AnswerInfo[]> {
    const sql =
      `SELECT a.*, IF(al.user_id IS NULL, 'false', 'true') AS is_like
      FROM answer a
      LEFT JOIN answer_like al ON a.id = al.answer_id AND al.user_id = :myId
      WHERE a.question_id = :question_id 
      ORDER BY a.id`
    const rows = await this._findsIfExist(sql, { question_id, myId }, true)
    Promise.all(rows.map(row=>{
      const tags = this.findTag(row['id'])
      row = {...row, tags}
    }))
    return rows
  }

  async create(answer: AnswerCreationType, tags: string[]): Promise<void> {
    const sql =
    'INSERT INTO answer (question_id, title, user_id, language, code, content) VALUES (:question_id, :title, :user_id, :language, :code, :content)'
    const answer_id = await this._create(sql, {
      question_id: answer.question_id,
      title: answer.title,
      user_id: answer.user_id,
      language: answer.language,
      code: answer.code,
      content: answer.content,
    })
    this.addAllTag(tags, answer_id)
    questionInfoService.renew(answer.question_id)
    notify('user', answer.user_id, 'answer', 'answer', String(answer_id))
  }

  async update(answer: AnswerType, tags: string[]): Promise<void> {
    const sql =
      'UPDATE answer SET title = :title, content = :content, language = :language, code = :code, like_cnt = :like_cnt WHERE id = :id AND user_id = :user_id'
    await this._update(sql, {
      title: answer.title,
      language: answer.language,
      code: answer.code,
      content: answer.content,
      id: answer.id,
      user_id: answer.user_id,
    })
    this.removeAllTag(answer.id)
    this.addAllTag(tags, answer.id)
  }

  async delete(id: number, user_id: string): Promise<void> {
    const question_id = (await this.find(id)).question_id
    const sql = 'DELETE FROM answer WHERE id = :id AND user_id = :user_id'
    await this._delete(sql, { id, user_id })
    questionInfoService.renew(question_id)
  }

  async findLike(id: number, user_id: string): Promise<AnswerLikeType> {
    const sql = 'SELECT * FROM answer_like WHERE answer_id = :id AND user_id = :user_id'
    const row = await this._findIfExist(sql, { id, user_id }, true)
    return {
      user_id: row['user_id'],
      answer_id: row['answer_id'],
    }      
  }

  async like(id: number, user_id: string): Promise<void> {
    const like = await this.findLike(id, user_id)
    if (like.user_id && like.answer_id) {
      const sql1 = 'DELETE FROM answer_like WHERE user_id = :user_id AND answer_id = :answer_id'
      const sql2 = 'UPDATE answer SET like_cnt = like_cnt-1 WHERE id = :id'
      await this._delete(sql1, { answer_id: id, user_id })
      await this._update(sql2, { id })
    } else {
      const sql1 = 'INSERT INTO answer_like (answer_id, user_id) VALUES (:answer_id, :user_id)'
      const sql2 = 'UPDATE answer SET like_cnt = like_cnt+1 WHERE id = :id'
      await this._create(sql1, { answer_id: id, user_id })
      await this._update(sql2, { id })
      notify('user', user_id, 'like', 'answer', String(id))
    }
  }

  async createTag(name: string): Promise<void> {
    const sql = 'INSERT INTO answer_tag (name) VALUES (:name)'
    await this._create(sql, { name, })
  }

  async addTag(tag_name: string, answer_id: number): Promise<void> {
    const sql = `INSERT INTO answer_tag_map 
    (tag_id, answer_id) 
    (
      SELECT max(id), :answer_id
      FROM answer_tag
      WHERE name = :tag_name
    )`
    await this._create(sql, {
      tag_name,
      answer_id,
    })
  }

  async addAllTag(tags: string[], answer_id: number): Promise<void> {
    tags.forEach(async tag => {
      const exist = await this.searchTag(tag)
      if (exist.length === 0) {
        this.createTag(tag)
      }
    })
    Promise.all(tags.map(tag => {
      this.addTag(tag, answer_id)
    }))
  }

  async removeAllTag(answer_id: number): Promise<void> {
    const sql = 'DELETE FROM answer_tag_map WHERE answer_id = :answer_id'
    await this._delete(sql, { answer_id })
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

  async searchTag(name: string): Promise<string[]> {
    const sql = 
    `SELECT name 
    FROM answer_tag 
    WHERE name = :name`
    const rows = await this._findsIfExist(sql, { name }, true)
    return rows
  }
}

export default new Answer(getConfig().db)
