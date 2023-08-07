import { IResult as UA } from 'ua-parser-js'
import { UserType as User } from '../service/user'

declare global {
  namespace Express {
    interface Request {
      ua: UA
      credentials?: {
        user?: User
      }
    }

    interface Response {
      error?: {
        name: string
        code: number
        msg?: string
      }
    }
  }
}
