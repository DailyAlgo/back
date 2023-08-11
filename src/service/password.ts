import { PoolOptions } from 'mysql2/promise'
import getConfig from "../config/config"
import { Base } from "./base"
import * as bcrypt from 'bcrypt'

export type PasswordType = {
  user_id: string
  salt: string
  password: string
  created_time: Date
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

  async compare(id: string, password: string): Promise<boolean> {
    const sql = 'SELECT * FROM user WHERE id = :id'
    const row = await this._find(sql, { id: id })
    const userPassword = row['password']
    const salt = row['salt']
    const hashedPassword = await bcrypt.hash(password, salt)
    return userPassword === hashedPassword;
  }

  async changePassword(user_id: string, password: string): Promise<void> {
    const modified_time = Date.now();
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const sql = 'UPDATE password SET salt = :salt, password = :password, modified_time = :modified_time where user_id = :user_id'
    await this._update(sql, {
      user_id,
      salt,
      password: hashedPassword,
      modified_time,
    })
  }

  async create(password: PasswordCreationType): Promise<void> {
    const created_time = Date.now();
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password.password, salt)
    const sql =
      'INSERT INTO password (user_id, salt, password, created_time) VALUES (:user_id, :salt, :password, :created_time)'
    await this._create(sql, {
      user_id: password.user_id,
      salt,
      password: hashedPassword,
      created_time,
    })
  }
}

export default new Password(getConfig().db)
