import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'

type UserType = {
  id: string
  password: string
  name: string
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
      password: row['password'],
      name: row['name'],
    }
  }

  async create(user: UserType): Promise<void> {
    const sql =
      'INSERT INTO user (id, password, name) VALUES (:id, :password, :name)'
    await this._create(sql, {
      id: user.id,
      password: user.password,
      name: user.name,
    })
  }
}

export default new User(getConfig().db)
