
import { Base } from './base'
import { PoolOptions } from 'mysql2'
import getConfig from '../config/config'

interface NotificationBase {
  user_id: string
  type: string
  subject?: string
  subject_id?: string
  subject_name?: string
  object: string
  object_id: string
  object_name: string
  target_url?: string
  content?: string
}

interface NotificationInfo extends NotificationBase {
  id: number
  is_read: boolean
  user_id: string
  type: string
  subject?: string
  subject_id?: string
  subject_name?: string
  object: string
  object_id: string
  object_name: string
  target_url?: string
  content?: string
  created_time: Date
}

export class Notification extends Base {
  constructor(options: PoolOptions) {
    super(options)
  }

  async find(id: number, user_id: string, optional: boolean): Promise<NotificationInfo> {
    const sql = 'SELECT * FROM notification WHERE id = :id AND user_id = :user_id'
    const row = await this._findIfExist(sql, { id, user_id }, optional)
    return {
      id: row['id'],
      is_read: row['is_read'],
      user_id: row['user_id'],
      type: row['type'],
      subject: row['subject'],
      subject_id: row['subject_id'],
      subject_name: row['subject_name'],
      object: row['object'],
      object_id: row['object_id'],
      object_name: row['object_name'],
      target_url: row['target_url'],
      content: row['content'],
      created_time: row['created_time'],
    }
  }

  async finds(user_id: number, unreadOnly: boolean, offset: number): Promise<NotificationInfo[]> {
    const limit = 10
    const sql =
      `SELECT * 
      FROM notification 
      WHERE user_id = :user_id 
      ${unreadOnly?'AND is_read = FALSE ':' '}
      ORDER BY id
      LIMIT :limit OFFSET :offset`
    const rows = await this._findsIfExist(sql, { user_id, limit, offset }, true)
      return rows
  }

  async create(notification: NotificationBase): Promise<void> {
    const sql =
      `INSERT INTO notification 
      (user_id, type, subject, subject_id, subject_name, object, object_id, object_name, target_url, content) 
      VALUES (:user_id, :type, :subject, :subject_id, :subject_name, :object, :object_id, :object_name, :target_url, :content)`
    await this._create(sql, {
      user_id: notification.user_id,
      type: notification.type,
      subject: notification.subject,
      subject_id: notification.subject_id,
      subject_name: notification.subject_name,
      object: notification.object,
      object_id: notification.object_id,
      object_name: notification.object_name,
      target_url: notification.target_url,
      content: notification.content,
    })
  }

  async delete(id: number, user_id: string): Promise<void> {
    const sql = 'DELETE FROM notification WHERE id = :id AND user_id = :user_id'
    await this._delete(sql, { id, user_id })
  }

  async read(id: number, user_id: string): Promise<void> {
    const sql = 'UPDATE notification SET is_read = TRUE WHERE id = :id AMD user_id = :user_id'
    await this._update(sql, { id, user_id })
  }
}

export default new Notification(getConfig().db)
