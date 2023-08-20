import nodemailer, { Transporter, SendMailOptions } from 'nodemailer'
import { Options } from 'nodemailer/lib/smtp-transport'
import getConfig from '../config/config'

class Mail {
  private transporter: Transporter

  constructor(options: Options) {
    this.transporter = nodemailer.createTransport(options)
  }

  async end(): Promise<void> {
    return this.transporter.close()
  }

  async sendMail(options: SendMailOptions) {
    this.transporter.sendMail(options)
  }
}

export default new Mail(getConfig().mail)
