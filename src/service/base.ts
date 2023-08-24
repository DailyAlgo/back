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

  protected async _findIfExist(
    sql: string,
    values: { [param: string]: string | boolean | Date | number },
    optional?: boolean
  ): Promise<any> {
    const [rows] = await this.promisePool.query<RowDataPacket[]>(sql, values)

    if (rows.length == 0 && optional) {
      return 0
    }

    if (rows.length == 0 && !optional) {
      throw new Error('NOT_FOUND')
    }

    if (rows.length > 1) {
      throw new Error('DUP_FOUND')
    }

    const row = rows[0]

    return row
  }

  protected async _findsIfExist(
    sql: string,
    values: { [param: string]: number | string },
    optional?: boolean
  ): Promise<any> {
    const [rows] = await this.promisePool.query<RowDataPacket[]>(sql, values)

    if (rows.length == 0 && !optional) {
      throw new Error('NOT_FOUND')
    }

    return rows
  }

  protected async _create(
    sql: string,
    values: { [param: string]: string | boolean | Date | number }
  ): Promise<number> {
    const [result] = await this.promisePool.query<ResultSetHeader>(sql, values)

    if (result.affectedRows !== 1) {
      throw new Error('CREATE FAILED')
    }
    return result.insertId
  }

  protected async _update(
    sql: string,
    values: { [param: string]: string | boolean | Date | number | null | undefined | string[] }
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
