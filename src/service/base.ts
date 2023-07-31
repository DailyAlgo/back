import mysql, { PoolOptions, Pool, RowDataPacket } from 'mysql2'
import { Pool as promisePool } from 'mysql2/promise'

export abstract class Base {
  private readonly pool: Pool
  private readonly promisePool: promisePool

  constructor(options: PoolOptions) {
    this.pool = mysql.createPool({ ...options, namedPlaceholders: true })
    this.promisePool = this.pool.promise()
  }

  async end(): Promise<void> {
    return await this.promisePool.end()
  }

  protected async _find(
    sql: string,
    values: { [param: string]: string | boolean | Date }
  ): Promise<any> {
    const [rows] = await this.promisePool.query<RowDataPacket[]>(sql, values)

    if (rows.length == 0) {
      throw new Error('NOT_FOUND')
    }

    if (rows.length > 1) {
      throw new Error('DUP_FOUND')
    }

    const row = rows[0]

    return row
  }
  // protected async _save() {}
}
