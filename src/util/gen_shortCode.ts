import * as bcrypt from 'bcrypt'
import { findIfExistByCode } from '../controller/organization'

const getCode_6_digits = async (value: string, salt: string): Promise<string> => {
  const hash = await bcrypt.hash(value, salt)
  return hash.slice(54,60)
}

export const getOrganizationCode = async (name: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  let code = await getCode_6_digits(name, salt)
  while ((await findIfExistByCode(code)) ) {
    code = await getCode_6_digits(code, salt)
  }
  return code
}