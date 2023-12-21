import { NextFunction, Request, Response } from "express"
import organizationService from "../service/organization"
import { getOrganizationCode } from "../util/gen_shortCode"

export const findIdByCode = async (code: string): Promise<number> => {
  return (await organizationService.find(code, true)).id
}

export const findIfExistByCode = async (code: string): Promise<boolean> => {
  return !((await organizationService.count(code)) == 0)
}

export const findOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const code = req.query.code
    const organization = await organizationService.find(code as string, false)
    res.status(200).send(organization.name)
  } catch (error) {
    next(error)
  }
}

export const insertOrganizatioon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const code: string = await getOrganizationCode(req.body.name)
    await organizationService.create({
      name: req.body.name,
      code,
      master: req.credentials.user.id,
    })
    res.status(200).json({ code })
  } catch (error) {
    next(error)
  }
}

export const deleteOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const code = req.params['code']
    res.status(200).json(await organizationService.delete(code, req.credentials.user.id))
  } catch (error) {
    next(error)
  }
}

export const joinOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const code = req.params['code']
    res.status(200).json(await organizationService.join(code, req.credentials.user.id))
  } catch (error) {
    next(error)
  }
}

export const withdrawOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.credentials?.user)
      return res.status(400).json({ message: 'User Info is missing' })
    const code = req.params['code']
    res.status(200).json(await organizationService.withdraw(code, req.credentials.user.id))
  } catch (error) {
    next(error)
  }
}