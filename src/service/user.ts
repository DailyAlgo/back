import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'

export class User extends Base {
  constructor(options: PoolOptions) {
    super(options)
  }

  async find(id: string): Promise<any> {
    const sql = 'SELECT * FROM user WHERE id = :id'
    return await this._find(sql, { id: id })
  }
}

export default new User(getConfig().db)
