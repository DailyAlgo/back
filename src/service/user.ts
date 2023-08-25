import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'
import passwordService from './password'
import organizationService from './organization'
import questionService from './question'

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

interface UserProfile extends UserInfo {
  id: string
  name: string
  nickname: string
  email: string
  created_time: Date
  organizations: string[]
  question_cnt: number
  answer_cnt: number
  view_cnt: number
  follower_cnt: number
  following_cnt: number
}

interface UserInfoCredential extends Omit<UserInfo, 'created_time'> {
  password: string
  organization_code?: string
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

  async find(id: string, optional: boolean): Promise<UserProfile> {
    const sql = 
    `SELECT u.id, u.name, u.nickname, u.email, u.created_time, 
    COUNT(q.id) as question_cnt, COUNT(a.id) as answer_cnt, IFNULL(SUM(q.view_cnt), 0) as view_cnt, 
    COUNT(follower.follower_id) as follower_cnt, COUNT(following.following_id) as following_cnt
    FROM user u
    LEFT OUTER JOIN (SELECT q.id, qi.view_cnt, q.user_id FROM question q INNER JOIN question_info qi ON q.id = qi.question_id) q ON u.id = q.user_id
    LEFT OUTER JOIN answer a ON u.id = a.user_id
    LEFT OUTER JOIN follow follower ON follower.following_id = u.id
    LEFT OUTER JOIN follow following ON following.follower_id = u.id
    WHERE u.id = :id
    GROUP BY u.id, u.name, u.nickname, u.email, u.created_time`
    const row = await this._findIfExist(sql, { id: id }, optional)
    const sql_organization = 
    `SELECT o.name
    FROM user u
    LEFT OUTER JOIN user_organization_map uom ON u.id = uom.user_id
    INNER JOIN organization o ON o.id = uom.organization_id 
    WHERE u.id = :id
    `
    const organizations = await this._findIfExist(sql_organization, { id: id }, true)
    return {
      id: row['id'] || '0',
      name: row['name'],
      nickname: row['nickname'],
      email: row['email'],
      created_time: row['created_time'],
      question_cnt: row['question_cnt'],
      answer_cnt: row['answer_cnt'],
      view_cnt: row['view_cnt'],
      follower_cnt: row['follower_cnt'],
      following_cnt: row['following_cnt'],
      organizations
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
    if (user.organization_code) {
      const organization = await organizationService.find(user.organization_code, false)
      organizationService.join(organization.id, user.id)
    }
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
      LEFT OUTER JOIN answer a ON q.id = a.question_id 
      WHERE q.user_id = :user_id 
      GROUP BY q.id, q.title, q.source, q.type, q.user_id 
      LIMIT :limit OFFSET :offset`
    const rows = await this._findsIfExist(sql, { user_id: id, offset, limit }, true)
    return Promise.all(rows.map(row=>{
      const tags = questionService.findTag(row['id'])
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
      const tags = questionService.findTag(row['id'])
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
      LEFT OUTER JOIN answer a ON q.id = a.question_id 
      WHERE s.user_id = :user_id 
      GROUP BY q.id, q.title, q.source, q.type, q.user_id 
      LIMIT :limit OFFSET :offset`
    const rows = await this._findsIfExist(sql, { user_id: id, offset, limit }, true)
    return Promise.all(rows.map(row=>{
      const tags = questionService.findTag(row['id'])
      return {...row, tags}
    }))
  }
}

export default new User(getConfig().db)
