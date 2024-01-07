import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'
import questionInfoService from './question_info'

export type QuestionType = {
  id: number
  title: string
  user_id: string
  source: string
  link: string
  type: string
  content: string
  language: string
  code: string
  created_time?: Date
  modified_time?: Date
}

type QuestionCreationType = {
  title: string
  user_id: string
  source: string
  link: string
  type: string
  content: string
  language: string
  code: string
}

type QuestionListType = {
  total_cnt: number
  nextIndex: number
  question_list: QuestionListItemType[]
}

type QuestionListItemType = {
  id: string
  title: SVGStringList
  source: string
  type: string
  view_cnt: number
  like_cnt: number
  answer_cnt: number
  comment_cnt: number
  tags: string[]
  user_id: string
  user_nickname: string
  created_time: Date
  is_scrap: boolean
  is_like: boolean
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
  language: string
  code: string
  created_time: Date
  modified_time?: Date
  view_cnt: number
  like_cnt: number
  answer_cnt: number
  comment_cnt: number
  tags: string[]
}

type QuestionLikeType = {
  user_id: string
  question_id: number
}

type QuestionScrapType = {
  user_id: string
  question_id: number
}

export class Question extends Base {
  constructor(options: PoolOptions) {
    super(options)
  }

  async find(id: number): Promise<QuestionDetailType> {
    const sql =
      `SELECT q.*, qi.*, u.nickname 
      FROM question q 
      INNER JOIN question_info qi ON q.id = qi.question_id 
      INNER JOIN user u ON q.user_id = u.id 
      WHERE q.id = :id`
    const row = await this._findIfExist(sql, { id: id }, false)
    const tags = await this.findTag(row['id'])
    questionInfoService.view(id)
    return {
      id: row['id'],
      title: row['title'],
      user_id: row['user_id'],
      user_nickname: row['nickname'],
      source: row['source'],
      link: row['link'],
      type: row['type'],
      content: row['content'],
      language: row['language'],
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

  async finds(offset: number): Promise<QuestionListType> {
    const count = await this.count()
    const limit = 10
    const nextIndex = offset + limit
    const sql =
      `SELECT q.id, q.title, q.source, q.type, qi.view_cnt, qi.like_cnt, qi.answer_cnt, qi.comment_cnt, q.user_id, q.created_time 
      FROM question q 
      INNER JOIN question_info qi ON q.id = qi.question_id 
      LIMIT :limit OFFSET :offset`
    const rows = await this._findsIfExist(sql, { offset, limit }, true)
    const question_list = await  Promise.all(rows.map(async row=>{
      const tags = await this.findTag(row['id'])
      row = {...row, tags}
    }))
    const res = {
      total_cnt: count,
      question_list,
      nextIndex,
    }
    return res
  }

  async count(): Promise<number> {
    const sql = 'SELECT COUNT(*) FROM question'
    const row = await this._findIfExist(sql, {}, false)
    return row['COUNT(*)']
  }

  async create(question: QuestionCreationType, tags: string[]): Promise<number> {
    const sql =
      'INSERT INTO question (title, user_id, source, link, type, content, language, code) VALUES (:title, :user_id, :source, :link, :type, :content, :language, :code)'
    const question_id = await this._create(sql, {
      title: question.title,
      user_id: question.user_id,
      source: question.source,
      link: question.link,
      type: question.type,
      content: question.content,
      language: question.language,
      code: question.code,
    })
    questionInfoService.create(question_id)
    this.addAllTag(tags, question_id)
    return question_id
  }

  async update(question: QuestionType, tags: string[]): Promise<void> {
    const sql =
      'UPDATE question SET title = :title, source = :source, link = :link, type = :type, content = :content, language = :language, code = :code WHERE id = :id AND user_id = :user_id'
    await this._update(sql, {
      title: question.title,
      source: question.source,
      link: question.link,
      type: question.type,
      content: question.content,
      language: question.language,
      code: question.code,
      id: question.id,
      user_id: question.user_id,
    })
    await this.removeAllTag(question.id)
    await this.addAllTag(tags, question.id)
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

  async addTag(tag_name: string, question_id: number): Promise<void> {
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

  async addAllTag(tags: string[], question_id: number): Promise<void> {
    Promise.all(tags.map(async tag => {
      const exist = await this.searchTag(tag)
      if (exist.length === 0) {
        await this.createTag(tag)
      }
      this.addTag(tag, question_id)
    }))
  }

  async removeAllTag(question_id: number): Promise<void> {
    const sql = 'DELETE FROM question_tag_map WHERE question_id = :question_id'
    await this._deleteAll(sql, { question_id })
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

  async search(
    keyword: string, source: string, type: string, status: string, order: string, offset: number, myId: string, tag: string
  ): Promise<QuestionListType> {
    const count = await this.seacrhCount(keyword, source, type, status, tag)
    const limit = 10
    const nextIndex = offset + limit
    keyword = '%'+keyword.trim()+'%'
    source = source === 'all' ? '%' : source
    type = type === 'all' ? '%' : type
    switch (status) {
      case 'all':
        status = '1=1'
        break
      case 'answered':
        status = 'qi.answer_cnt > 0'
        break
      case 'not_answered':
        status = 'qi.answer_cnt = 0'
        break
    }
    order = order === 'new' ? 'q.id DESC' : 'q.id ASC'
    tag = tag === 'all' ? '%' : tag
    // const tagCondition = "'" + tags.join("','") + "'"
    // const findTags = tags.length > 0 ? 'AND qt.name IN (:tagCondition)' : 'AND (1=1 OR qt.name = :tagCondition))'
    const sql = 
      `SELECT q.id, q.title, q.source, q.type, qi.view_cnt, qi.like_cnt, qi.answer_cnt, qi.comment_cnt, q.user_id, u.nickname as user_nickname, q.created_time 
      , IF(s.user_id IS NULL, false, true) AS is_scrap
      , IF(ql.user_id IS NULL, false, true) AS is_like
      FROM question q 
      INNER JOIN question_info qi ON q.id = qi.question_id 
      INNER JOIN user u ON q.user_id = u.id
      LEFT JOIN scrap s ON q.id = s.question_id AND s.user_id = :myId
      LEFT JOIN question_like ql ON q.id = ql.question_id AND ql.user_id = :myId
      INNER JOIN question_tag_map qtm ON q.id = qtm.question_id
      INNER JOIN question_tag qt ON qtm.tag_id = qt.id
      WHERE q.title LIKE :keyword
      AND q.source LIKE :source
      AND q.type LIKE :type
      AND ${status}
      AND qt.name LIKE :tag
      ORDER BY ${order}
      LIMIT :limit OFFSET :offset`
    const rows = await this._findsIfExist(sql, { keyword, source, type, status, order, limit, offset, myId, tag }, true)
    const question_list = await Promise.all(rows.map(async row=>{
      const tags = await this.findTag(row['id'])
      return {...row, tags}
    }))
    const res = {
      total_cnt: count,
      question_list,
      nextIndex,
    }
    return res
  }

  async seacrhCount(keyword: string, source: string, type: string, status: string, tag: string): Promise<number> {
    keyword = '%'+keyword.trim()+'%'
    source = source === 'all' ? '%' : source
    type = type === 'all' ? '%' : type
    switch (status) {
      case 'all':
        status = '1=1'
        break
      case 'answered':
        status = 'qi.answer_cnt > 0'
        break
      case 'not_answered':
        status = 'qi.answer_cnt = 0'
        break
    }
    // const tagCondition = "'" + tags.join("','") + "'"
    // const findTags = tags.length > 0 ? 'AND qt.name IN (:tagCondition)' : 'AND (1=1 OR qt.name = :tagCondition))'
    tag = tag === 'all' ? '%' : tag
    const sql = 
      `SELECT COUNT(*) 
      FROM question q 
      INNER JOIN question_info qi ON q.id = qi.question_id 
      LEFT JOIN question_tag_map qtm ON q.id = qtm.question_id
      LEFT JOIN question_tag qt ON qtm.tag_id = qt.id
      WHERE q.title LIKE :keyword
      AND q.source LIKE :source
      AND q.type LIKE :type
      AND ${status}
      AND qt.name LIKE :tag
      `
    const row = await this._findIfExist(sql, { keyword, source, type, status, tag}, false)
    return row['COUNT(*)']
  }

  async findScrap(user_id: string, question_id: number): Promise<QuestionScrapType> {
    const sql = 'SELECT * FROM scrap WHERE user_id = :user_id AND question_id = :question_id'
    const row = await this._findIfExist(sql, { user_id, question_id, }, true)
    return {
      user_id: row['user_id'],
      question_id: row['question_id'],
    }
  }

  async scrap(user_id: string, question_id: number): Promise<boolean> {
    const scrap = await this.findScrap(user_id, question_id)
    if (scrap.question_id && scrap.user_id) {
      const sql = 'DELETE FROM scrap WHERE user_id = :user_id AND question_id = :question_id'
      await this._delete(sql, { user_id, question_id, })
      return false
    } else {
      const sql = 'INSERT INTO scrap (user_id, question_id) VALUES (:user_id, :question_id)'
      await this._create(sql, { user_id, question_id, })
      return true
    }
  }

  async isScrap(user_id: string, question_id: number): Promise<boolean> {
    const sql = 'SELECT * FROM scrap WHERE user_id = :user_id AND question_id = :question_id'
    const scrap = await this._findIfExist(sql, { user_id, question_id, }, true)
    if (scrap < 0) {
      return false
    }
    return true
  }

  async findLike(question_id: number, user_id: string): Promise<QuestionLikeType> {
    const sql = 'SELECT * FROM question_like WHERE user_id = :user_id AND question_id = :question_id'
    const row = await this._findIfExist(sql, { user_id, question_id, }, true)
    return {
      user_id: row['user_id'],
      question_id: row['question_id'],
    }
  }

  async isLike(user_id: string, question_id: number): Promise<boolean> {
    const sql = 'SELECT * FROM question_like WHERE user_id = :user_id AND question_id = :question_id'
    const like = await this._findIfExist(sql, { user_id, question_id, }, true)
    if (like < 0) {
      return false
    }
    return true
  }

  async like(question_id: number, user_id: string): Promise<boolean> {
    const like = await this.findLike(question_id, user_id)
    if (like.question_id && like.user_id) {
      const sql = 'DELETE FROM question_like WHERE user_id = :user_id AND question_id = :question_id'
      await this._delete(sql, { user_id, question_id, })
      await questionInfoService.like(question_id, user_id, false)
      return false
    } else {
      const sql = 'INSERT INTO question_like (user_id, question_id) VALUES (:user_id, :question_id)'
      await this._create(sql, { user_id, question_id, })
      await questionInfoService.like(question_id, user_id, true)
      return true
    }
  }
}

export default new Question(getConfig().db)
