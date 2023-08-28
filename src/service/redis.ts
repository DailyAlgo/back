import { Cache } from './cache'
import { RedisClientOptions } from 'redis'
import getConfig from '../config/config'

export class Redis extends Cache {
  constructor(options: RedisClientOptions) {
    super(options)
  }

  async set(key: string, value: string | number): Promise<boolean> {
    return await this._create(key, value)
  }

  async get(key: string, optional: boolean): Promise<any> {
    return await this._findIfExist(key, optional)
  }

  async getOrSet(key: string, callback: Function): Promise<any> {
    try {
      // Cache Hit
      return await this._findIfExist(key, false)
    } catch(error) {
      // Cache Miss
      const value = callback()
      this._create(key, value)
      return value
    }
  }

  async rename(key: string, newKey: string): Promise<void> {
    await this._rename(key, newKey)
  }

  async delete(key: string): Promise<void> {
    await this._delete(key)
  }

}

export default new Redis(getConfig().cache)