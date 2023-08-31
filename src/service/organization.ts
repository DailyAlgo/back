
import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'
import { notify } from '../util/gen_notification'

interface OrganizationInfo {
  name: string
  code: string
  master: string
}

interface OrganizationDetail extends OrganizationInfo {
  id: number
  name: string
  code: string
  master: string
  created_time: Date
}

export class Organization extends Base {
  constructor(options: PoolOptions) {
    super(options)
  }

  async find(code: string, optional: boolean): Promise<OrganizationDetail> {
    const sql = 'SELECT * FROM organization WHERE code = :code'
    const row = await this._findIfExist(sql, { code }, optional)
    return {
      id: row['id'],
      name: row['name'],
      code: row['code'],
      master: row['master'],
      created_time: row['created_time'],
    }
  }

  async findById(id: number, optional: boolean): Promise<OrganizationDetail> {
    const sql = 'SELECT * FROM organization WHERE id = :id'
    const row = await this._findIfExist(sql, { id }, optional)
    return {
      id: row['id'],
      name: row['name'],
      code: row['code'],
      master: row['master'],
      created_time: row['created_time'],
    }
  }

  async create(organization: OrganizationInfo): Promise<void> {
    const sql =
      'INSERT INTO organization (name, code, master) VALUES (:name, :code, :master)'
    await this._create(sql, {
      name: organization.name,
      code: organization.code,
      master: organization.master,
    })
  }

  async delete(id: number, user_id: string): Promise<void> {
    const sql = 'DELETE FROM organization WHERE id = :id AND master = :user_id'
    await this._delete(sql, {
      id,
      user_id,
    })
  }

  async join(id: number, user_id: string): Promise<void> {
    const sql = 'INSERT INTO user_organization_map (organization_id, user_id) VALUES (:id, :user_id)'
    await this._create(sql, { id, user_id })
    notify('user', user_id, 'join', 'organization', String(id))
  }

  async withdraw(id: number, user_id: string): Promise<void> {
    const sql = 'DELETE FROM user_organization_map WHERE organization_id = :id AND user_id = :user_id'
    await this._delete(sql, { id, user_id })
  }
}

export default new Organization(getConfig().db)
