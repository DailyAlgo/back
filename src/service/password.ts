import { PoolOptions } from 'mysql2/promise'
import getConfig from '../config/config'
import { Base } from './base'
import * as bcrypt from 'bcrypt'

export type PasswordType = {
  user_id: string
  salt: string
  password: string
  created_time?: Date
  modified_time?: Date
}

export type PasswordCreationType = {
  user_id: string
  password: string
}

export class Password extends Base {
  constructor(options: PoolOptions) {
    super(options)
  }

  async compare(id: string, password: string): Promise<void> {
    const sql = 'SELECT * FROM password WHERE user_id = :id'
    const row = await this._findIfExist(sql, { id: id }, false)
    if (row['password'] !== (await bcrypt.hash(password, row['salt']))) {
      throw new Error('Incorrect Password')
    }
  }

  async update(user_id: string, password: string): Promise<void> {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const sql =
      'UPDATE password SET salt = :salt, password = :password where user_id = :user_id'
    await this._update(sql, {
      user_id,
      salt,
      password: hashedPassword,
    })
  }

  async create(password: PasswordCreationType): Promise<void> {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password.password, salt)
    const sql =
      'INSERT INTO password (user_id, salt, password) VALUES (:user_id, :salt, :password)'
    await this._create(sql, {
      user_id: password.user_id,
      salt,
      password: hashedPassword,
    })
  }
}

export default new Password(getConfig().db)
