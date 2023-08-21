import { createClient, RedisClientType, RedisDefaultModules, RedisModules, RedisFunctions, RedisScripts, RedisClientOptions } from 'redis'

export abstract class Cache {
  private readonly client: RedisClientType<RedisDefaultModules & RedisModules, RedisFunctions, RedisScripts> // v3, Callback 기반 객체
  private readonly v4client: Record<string, any> // v4, Promise 기반 객체

  constructor(options: RedisClientOptions) {
    // Redis 연결
    this.client = createClient({ ...options, legacyMode: true })
    this.client.on('connect', () => {
      console.log('redis connected')
    })
    this.client.on('error', (error) => {
      console.error('redis client error', error)
    })
    this.client.connect().then() // redis v4 연결
    this.v4client = this.client.v4
  }

  async end(): Promise<void> {
    return await this.client.disconnect()
  }

  protected async _findIfExist(
    key: string,
    optional?: boolean,
  ): Promise<any> {
    const value = await this.v4client.get(key)
    if (!value && optional) {
      return null
    }
    if (!value && !optional) {
      throw new Error('NOT_FOUND')
    }
    return value
  }
  
  protected async _create(
    key: string,
    value: string | boolean | Date | number,
  ): Promise<boolean> {
    const result: boolean = await this.v4client.set(key, value)
    if (!result) {
      throw new Error('CACHE SET FAILED')
    }
    return result
  }

  protected async _rename(
    key: string,
    newKey: string,
  ): Promise<void> {
    await this.v4client.rename(key, newKey)
  }

  protected async _delete(
    key: string,
  ): Promise<void> {
    const exist = await this.v4client.exists(key) // true: 1, false: 0
    if (!exist) {
      throw new Error('DATA NOT EXIST')
    }
    return await this.v4client.del(key)
  }
}
