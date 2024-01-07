import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'
import passwordService from './password'
import organizationService from './organization'
import questionService from './question'
import { notify } from '../util/gen_notification'

interface UserNickname {
  id: string
  nickname: string
  intro?: string
  is_following?: boolean
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
  intro: string
  email: string
  created_time: Date
  organizations: OrganizationInfo[]
  question_cnt: number
  answer_cnt: number
  view_cnt: number
  follower_cnt: number
  following_cnt: number
}

interface OrganizationInfo {
  name: string
  code: string
}

interface UserInfoCredential extends Omit<UserInfo, 'created_time'> {
  password: string
  organization_code?: string
}

type UserQuestionListType = {
  total_cnt: number
  nextIndex: number
  question_list: UserQuestionListItemType[]
}

interface UserQuestionListItemType {
  id: string
  title: string
  source: string
  type: string
  tags: string[]
  user_id: string
  question_created_time: Date
  is_scrap: boolean
  is_like: boolean
}

export class User extends Base {
  constructor(options: PoolOptions) {
    super(options)
  }

  async find(id: string, optional: boolean): Promise<UserProfile> {
    const sql = 
    `SELECT u.id, u.name, u.nickname, u.intro, u.email, u.created_time, 
    COUNT(DISTINCT q.id) as question_cnt, COUNT(DISTINCT a.id) as answer_cnt, IFNULL(SUM(q.view_cnt), 0) as view_cnt,
    COUNT(DISTINCT follower.follower_id) as follower_cnt, COUNT(DISTINCT following.following_id) as following_cnt
    FROM user u
    LEFT OUTER JOIN (SELECT q.id, qi.view_cnt, q.user_id FROM question q INNER JOIN question_info qi ON q.id = qi.question_id) q ON u.id = q.user_id
    LEFT OUTER JOIN answer a ON u.id = a.user_id
    LEFT OUTER JOIN follow follower ON follower.following_id = u.id
    LEFT OUTER JOIN follow following ON following.follower_id = u.id
    WHERE u.id = :id
    GROUP BY u.id, u.name, u.nickname, u.email, u.created_time`
    const row = await this._findIfExist(sql, { id: id }, optional)
    const sql_organization = 
    `SELECT o.name, o.code
    FROM user u
    LEFT OUTER JOIN user_organization_map uom ON u.id = uom.user_id
    INNER JOIN organization o ON o.id = uom.organization_id 
    WHERE u.id = :id
    `
    const organizations = await this._findsIfExist(sql_organization, { id: id }, true)
    return {
      id: row['id'] || '0',
      name: row['name'],
      nickname: row['nickname'],
      intro: row['intro'],
      email: row['email'],
      created_time: row['created_time'],
      question_cnt: row['question_cnt'],
      answer_cnt: row['answer_cnt'],
      view_cnt: row['view_cnt'],
      follower_cnt: row['follower_cnt'],
      following_cnt: row['following_cnt'],
      organizations: organizations.map((organization: any) => {
        return {'name': organization['name'], 'code': organization['code']}
      })
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
      organizationService.join(user.organization_code, user.id)
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

  async lastLogin(id: string): Promise<void> {
    const sql = 'UPDATE user SET last_login = CURRENT_TIMESTAMP() WHERE id = :id'
    await this._update(sql, {
      id,
    })
  }

  async follow(
    follower_id: string,
    following_id: string, 
  ): Promise<void> {
    if (follower_id === following_id) {
      throw new Error('BAD_REQUEST')
    }
    const follow = await this.findFollow(follower_id, following_id)
    const sql = follow 
    ? 'DELETE FROM follow WHERE follower_id = :follower_id AND following_id = :following_id'
    : 'INSERT INTO follow (follower_id, following_id) VALUES (:follower_id, :following_id)'
    if (follow) {
      await this._delete(sql, { follower_id, following_id })
    }
    else {
      await this._create(sql, { follower_id, following_id })
      notify('user', follower_id, 'follow', 'user', following_id)
    }
  }

  async findFollow(
    follower_id: string,
    following_id: string,
  ): Promise<boolean> {
    const sql = 'SELECT * FROM follow WHERE follower_id = :follower_id AND following_id = :following_id'
    const row = await this._findIfExist(sql, { follower_id, following_id }, true)
    return row['follower_id'] && row['following_id'] ? true : false
  }
  
  async findFollower(
    user_id: string,
    my_id: string,
  ): Promise<UserNickname[]> {
    const sql = 
    `SELECT u.id, u.nickname, u.intro, CASE WHEN ff.follower_id IS NOT NULL THEN true ELSE false END as is_following
    FROM follow f
    INNER JOIN user u ON f.follower_id = u.id
    LEFT JOIN follow ff ON ff.following_id = u.id AND ff.follower_id = :my_id
    WHERE f.following_id = :target_id`

    const rows = await this._findsIfExist(sql, { target_id: user_id, my_id }, true)
    return rows
  }
  
  async findFollowing(
    user_id: string,
    my_id: string,
  ): Promise<UserNickname[]> {
    const sql = 
    `SELECT u.id, u.nickname, u.intro, CASE WHEN ff.follower_id IS NOT NULL THEN true ELSE false END as is_following
    FROM follow f
    INNER JOIN user u ON f.following_id = u.id
    LEFT JOIN follow ff ON ff.following_id = u.id AND ff.follower_id = :my_id
    WHERE f.follower_id = :target_id`
    const rows = await this._findsIfExist(sql, { target_id: user_id, my_id }, true)
    return rows
  }

  async findQuestion(
    id: string,
    offset: number,
    my_id: string,
  ): Promise<UserQuestionListType> {
    const count = await this.questionCount(id)
    const limit = 10
    const nextIndex = offset + limit
    const sql = 
      `SELECT q.id, q.title, q.source, q.type, q.user_id, q.created_time as question_created_time
       , CASE WHEN s.question_id IS NOT NULL THEN true ELSE false END as is_scrap
       , CASE WHEN ql.question_id IS NOT NULL THEN true ELSE false END as is_like
      FROM question q 
      LEFT OUTER JOIN scrap s ON q.id = s.question_id AND s.user_id = :my_id
      LEFT OUTER JOIN question_like ql ON q.id = ql.question_id AND ql.user_id = :my_id
      WHERE q.user_id = :user_id 
      GROUP BY q.id, q.title, q.source, q.type, q.user_id, q.created_time 
      ORDER BY q.id DESC
      LIMIT :limit OFFSET :offset`
    const rows = await this._findsIfExist(sql, { user_id: id, offset, limit, my_id }, true)
    const question_list = await Promise.all(rows.map(async row=>{
      const tags = await questionService.findTag(row['id'])
      return {...row, tags}
    }))
    const res = {
      total_cnt: count,
      question_list,
      nextIndex,
    }
    return res
  }

  async questionCount(user_id: string): Promise<number> {
    const sql = 
      `SELECT COUNT(*) 
      FROM question q 
      WHERE q.user_id = :user_id`
    const row = await this._findIfExist(sql, { user_id }, false)
    return row['COUNT(*)']
  }

  async findAnswer(
    id: string,
    offset: number,
    my_id: string,
  ): Promise<UserQuestionListType> {
    const count = await this.answerCount(id)
    const limit = 10
    const nextIndex = offset + limit
    const sql = 
      `SELECT q.id, q.title, q.source, q.type, q.user_id, q.created_time as question_created_time
        , CASE WHEN s.question_id IS NOT NULL THEN true ELSE false END as is_scrap
        , CASE WHEN ql.question_id IS NOT NULL THEN true ELSE false END as is_like
      FROM answer a 
      INNER JOIN question q ON q.id = a.question_id
      LEFT OUTER JOIN question_like ql ON q.id = ql.question_id AND ql.user_id = :my_id
      LEFT OUTER JOIN scrap s ON q.id = s.question_id AND s.user_id = :my_id
      WHERE a.user_id = :user_id 
      GROUP BY q.id, q.title, q.source, q.type, q.user_id, q.created_time 
      ORDER BY a.id DESC
      LIMIT :limit OFFSET :offset`
    const rows = await this._findsIfExist(sql, { user_id: id, offset, limit, my_id }, true)
    const question_list = await Promise.all(rows.map(async row=>{
      const tags = await questionService.findTag(row['id'])
      return {...row, tags}
    }))
    const res = {
      total_cnt: count,
      question_list,
      nextIndex,
    }
    return res
  }

  async answerCount(user_id: string): Promise<number> {
    const sql = 
      `SELECT COUNT(*) 
      FROM answer a 
      INNER JOIN question q ON q.id = a.question_id 
      WHERE a.user_id = :user_id 
      GROUP BY a.user_id`
    const row = await this._findIfExist(sql, { user_id }, false)
    return row['COUNT(*)']
  }

  async findScrap(
    id: string,
    offset: number,
    my_id: string,
  ): Promise<UserQuestionListType> {
    const count = await this.scrapCount(id)
    const limit = 10
    const nextIndex = offset + limit
    const sql = 
      `SELECT q.id, q.title, q.source, q.type, q.user_id, q.created_time as question_created_time
        , CASE WHEN s.question_id IS NOT NULL THEN true ELSE false END as is_scrap
        , CASE WHEN ql.question_id IS NOT NULL THEN true ELSE false END as is_like
      FROM scrap s
      INNER JOIN question q ON q.id = s.question_id 
      LEFT OUTER JOIN question_like ql ON q.id = ql.question_id AND ql.user_id = :my_id
      LEFT OUTER JOIN scrap ss ON q.id = ss.question_id AND ss.user_id = :my_id
      WHERE s.user_id = :user_id 
      GROUP BY q.id, q.title, q.source, q.type, q.user_id, q.created_time 
      ORDER BY s.created_time DESC
      LIMIT :limit OFFSET :offset`
    const rows = await this._findsIfExist(sql, { user_id: id, offset, limit, my_id }, true)
    const question_list = await Promise.all(rows.map(async row=>{
      const tags = await questionService.findTag(row['id'])
      return {...row, tags}
    }))
    const res = {
      total_cnt: count,
      question_list,
      nextIndex,
    }
    return res
  }

  async scrapCount(user_id: string): Promise<number> {
    const sql = 
      `SELECT COUNT(*) 
      FROM scrap s
      INNER JOIN question q ON q.id = s.question_id 
      LEFT OUTER JOIN answer a ON q.id = a.question_id 
      WHERE s.user_id = :user_id 
      GROUP BY s.user_id`
    const row = await this._findIfExist(sql, { user_id }, false)
    return row['COUNT(*)']
  }
}

export default new User(getConfig().db)
