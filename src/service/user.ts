import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'
import passwordService from '../service/password'
import question from './question'

interface UserNickname {
  id: string
  nickname: string
  intro?: string
}

interface UserInfo extends UserNickname {
  id: string
  name: string
  nickname: string
  email: string
  created_time: Date
}

interface UserInfoCredential extends Omit<UserInfo, 'created_time'> {
  password: string
}

interface UserQuestionListType {
  id: string
  title: string
  source: string
  type: string
  tags: string[]
  user_id: string
  answer_created_time: Date
}

export class User extends Base {
  constructor(options: PoolOptions) {
    super(options)
  }

  async find(id: string, optional: boolean): Promise<UserInfo> {
    const sql = 'SELECT * FROM user WHERE id = :id'
    const row = await this._findIfExist(sql, { id: id }, optional)
    return {
      id: row['id'] || '0',
      name: row['name'],
      nickname: row['nickname'],
      email: row['email'],
      created_time: row['created_time'],
    }
  }

  async findIdByNickname(nickname: string): Promise<string> {
    const sql = 'SELECT id FROM user WHERE nickname = :nickname'
    const row = await this._findIfExist(sql, { nickname }, true)
    return row['id']
  }

  async findIdByEmail(email: string): Promise<string> {
    const sql = 'SELECT id FROM user WHERE email = :email'
    const row = await this._findIfExist(sql, { email }, false)
    return row['id']
  }

  async create(user: UserInfoCredential): Promise<void> {
    const sql =
      'INSERT INTO user (id, name, nickname, email) VALUES (:id, :name, :nickname, :email)'
    await this._create(sql, {
      id: user.id,
      name: user.name,
      nickname: user.nickname,
      email: user.email,
    })
    await passwordService.create({
      user_id: user.id,
      password: user.password,
    })
  }

  async update(user: UserNickname): Promise<void> {
    const sql = 'UPDATE user SET nickname = :nickname, intro = :intro WHERE id = :id'
    await this._update(sql, {
      nickname: user.nickname,
      id: user.id,
      intro: user.intro
    })
  }

  async delete(id: string): Promise<void> {
    const sql = 'DELETE FROM user WHERE id = :id'
    await this._delete(sql, {
      id,
    })
  }

  async follow(
    follower_id: string,
    following_id: string, 
    type: boolean
  ): Promise<void> {
    const sql = type 
      ? 'INSERT INTO follow (follower_id, following_id) VALUES (:follower_id, :following_id)'
      : 'DELETE FROM follow WHERE follower_id = :follower_id AND following_id = :following_id'
    type ? await this._create(sql, { follower_id, following_id }) : await this._delete(sql, { follower_id, following_id })
  }
  
  async findFollower(
    id: string
  ): Promise<string[]> {
    const sql = 'SELECT follower_id FROM follow WHERE following_id = :following_id'
    const rows = await this._findsIfExist(sql, { following_id: id }, true)
    return rows
  }
  
  async findFollowing(
    id: string
  ): Promise<string[]> {
    const sql = 'SELECT following_id FROM follow WHERE follower_id = :follower_id'
    const rows = await this._findsIfExist(sql, { follower_id: id }, true)
    return rows
  }

  async findQuestion(
    id: string,
    offset: number
  ): Promise<UserQuestionListType[]> {
    const limit = 10
    const sql = 
      `SELECT q.id, q.title, q.source, q.type, q.user_id, MAX(a.created_time) 
      FROM question q 
      INNER JOIN answer a ON q.id = a.question_id 
      WHERE q.user_id = :user_id 
      GROUP BY q.id, q.title, q.source, q.type, q.user_id 
      LIMIT :limit OFFSET :offset`
    const rows = await this._findsIfExist(sql, { user_id: id, offset, limit }, true)
    return Promise.all(rows.map(row=>{
      const tags = question.findTag(row['id'])
      return {...row, tags}
    }))
  }

  async findAnswer(
    id: string,
    offset: number
  ): Promise<UserQuestionListType[]> {
    const limit = 10
    const sql = 
      `SELECT q.id, q.title, q.source, q.type, q.user_id, MAX(a.created_time) 
      FROM answer a 
      INNER JOIN question q ON q.id = a.question_id 
      WHERE a.user_id = :user_id 
      GROUP BY q.id, q.title, q.source, q.type, q.user_id 
      LIMIT :limit OFFSET :offset`
    const rows = await this._findsIfExist(sql, { user_id: id, offset, limit }, true)
    return Promise.all(rows.map(row=>{
      const tags = question.findTag(row['id'])
      return {...row, tags}
    }))
  }

  async findScrap(
    id: string,
    offset: number
  ): Promise<UserQuestionListType[]> {
    const limit = 10
    const sql = 
      `SELECT q.id, q.title, q.source, q.type, q.user_id, MAX(a.created_time) 
      FROM scrap s
      INNER JOIN question q ON q.id = s.question_id 
      INNER JOIN answer a ON q.id = a.question_id 
      WHERE s.user_id = :user_id 
      GROUP BY q.id, q.title, q.source, q.type, q.user_id 
      LIMIT :limit OFFSET :offset`
    const rows = await this._findsIfExist(sql, { user_id: id, offset, limit }, true)
    return Promise.all(rows.map(row=>{
      const tags = question.findTag(row['id'])
      return {...row, tags}
    }))
  }
}

export default new User(getConfig().db)
