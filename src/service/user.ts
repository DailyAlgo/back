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
  password: string
}

type UserUpdateType = {
  id: string
  nickname: string
}

export class User extends Base {
  constructor(options: PoolOptions) {
    super(options)
  }

  async find(id: string, optional: boolean): Promise<UserType> {
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

  async findIdByEmail(email: string): Promise<string> {
    const sql = 'SELECT id FROM user WHERE email = :email'
    const row = await this._findIfExist(sql, { email }, false)
    return row['id']
  }

  async create(user: UserCreationType): Promise<void> {
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

  async update(user: UserUpdateType): Promise<void> {
    const sql = 'UPDATE user SET nickname = :nickname WHERE id = :id'
    await this._update(sql, {
      nickname: user.nickname,
      id: user.id,
    })
  }

  async delete(id: string): Promise<void> {
    const sql = 'DELETE FROM user WHERE id = :id'
    await this._delete(sql, {
      id,
    })
  }
}

export default new User(getConfig().db)
