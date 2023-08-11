import mysql, {
  PoolOptions,
  Pool,
  RowDataPacket,
  ResultSetHeader,
} from 'mysql2'
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
    values: { [param: string]: string | boolean | Date | number }
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

  protected async _findListPage(
    sql: string,
    values: { [param: string]: number }
  ): Promise<any> {
    const [rows] = await this.promisePool.query<RowDataPacket[]>(sql, values)

    if (rows.length == 0) {
      throw new Error('NOT_FOUND')
    }

    return rows
  }

  protected async _findListAll(
    sql: string,
    values: { [param: string]: string | number }
  ): Promise<any> {
    const [rows] = await this.promisePool.query<RowDataPacket[]>(sql, values)

    if (rows.length == 0) {
      throw new Error('NOT_FOUND')
    }

    return rows
  }

  protected async _create(
    sql: string,
    values: { [param: string]: string | boolean | Date | number }
  ): Promise<string | number> {
    const [result] = await this.promisePool.query<ResultSetHeader>(sql, values)

    if (result.affectedRows !== 1) {
      throw new Error('CREATE FAILED')
    }
    return result.insertId
  }
  // protected async _save() {}

  protected async _update(
    sql: string,
    values: { [param: string]: string | boolean | Date | number }
  ): Promise<void> {
    const [result] = await this.promisePool.query<ResultSetHeader>(sql, values)
    
    if (result.affectedRows !== 1) {
      throw new Error('UPDATE FAILED')
    }
  }

  protected async _delete(
    sql: string,
    values: { [param: string]: string | boolean | Date | number }
  ): Promise<void> {
    const [result] = await this.promisePool.query<ResultSetHeader>(sql, values)
    
    if (result.affectedRows !== 1) {
      throw new Error('DELETE FAILED')
    }
  }
}
