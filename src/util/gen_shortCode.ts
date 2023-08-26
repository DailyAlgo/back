import * as bcrypt from 'bcrypt'
import { findIdByCode } from '../controller/organization'

const getCode_6_digits = async (value: string, salt: string): Promise<string> => {
  const hash = await bcrypt.hash(value, salt)
  return hash.slice(0,6)
}

export const getOrganizationCode = async (name: string): Promise<string> => {
  const salt = await bcrypt.genSalt(1)
  let code = await getCode_6_digits(name, salt)
  while (await findIdByCode(code) < 0) {
    code = await getCode_6_digits(code, salt)
  }
  return code
}