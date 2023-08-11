import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'
import passwordService from '../service/password'

export type UserType = {
  id: string
  name: string
  nickname: string
  email: string
  created_time: Date
  modified_time?: Date
}

type UserCreationType = {
  id: string
  name: string
  nickname: string
  email: string
  password : string
}

export class User extends Base {
  constructor(options: PoolOptions) {
    super(options)
  }

  async find(id: string): Promise<UserType> {
    const sql = 'SELECT * FROM user WHERE id = :id'
    const row = await this._find(sql, { id: id })
    return {
      id: row['id'],
      name: row['name'],
      nickname: row['nickname'],
      email: row['email'],
      created_time: row['created_time'],
    }
  }

  async create(user: UserCreationType): Promise<void> {
    const created_time = Date.now();
    const sql =
      'INSERT INTO user (id, name, nickname, email, created_time) VALUES (:id, :name, :nickname, :email, :created_time)'
    await this._create(sql, {
      id: user.id,
      name: user.name,
      nickname: user.nickname,
      email: user.email,
      created_time,
      
    })
    passwordService.create({
      user_id: user.id,
      password: user.password,
    })
  }
}

export default new User(getConfig().db)
