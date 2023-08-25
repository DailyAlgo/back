
import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'

interface RefreshTokenData {
  user_id: string
  token: string
  expiration_time: Date
}

interface RefreshTokenInfo extends RefreshTokenData {
  id: number
  user_id: string
  token: string
  expiration_time: Date
  created_time: Date
}

export class RefreshToken extends Base {
  constructor(options: PoolOptions) {
    super(options)
  }

  async find(token: string, optional: boolean): Promise<RefreshTokenInfo> {
    const sql = 'SELECT * FROM refresh_token WHERE token = :token'
    const row = await this._findIfExist(sql, { token }, optional)
    return {
      id: row['id'],
      user_id: row['user_id'],
      token: row['token'],
      expiration_time: row['expiration_time'],
      created_time: row['created_time'],
    }
  }

  async create(refresh_token: RefreshTokenData): Promise<number> {
    const sql =
      'INSERT INTO refresh_token (id, user_id, token, expiration_time) VALUES (:id, :user_id. :token, :expiration_time)'
    return await this._create(sql, {
      user_id: refresh_token.user_id,
      token: refresh_token.token,
      expiration_time: refresh_token.expiration_time,
    })
  }

  async update(id: number, token: string, expiration_time: Date): Promise<void> {
    const sql = 'UPDATE refresh_token SET token = :token, expiration_time = :expiration_time WHERE id = :id'
    await this._update(sql, {
      id, token, expiration_time
    })
  }

  async delete(id: number): Promise<void> {
    const sql = 'DELETE FROM refresh_token WHERE id = :id'
    await this._delete(sql, {
      id,
    })
  }
}

export default new RefreshToken(getConfig().db)
