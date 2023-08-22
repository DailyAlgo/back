import { NextFunction, Request, Response } from "express"
import organizationService from "../service/organization"
import { getOrganizationCode } from "../util/gen_shortCode"

export const findIdByCode = async (code: string): Promise<string> => {
  return await organizationService.findIdByCode(code)
}

export const findOrganizatioon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params['id'])
    res.status(200).json(await organizationService.find(id, false))
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
    res.status(200).json(await organizationService.create({
      name: req.body.name,
      code,
      master: req.credentials.user.id,
    }))
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
    const id = Number(req.params['id'])
    res.status(200).json(await organizationService.delete(id, req.credentials.user.id))
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
    const id = Number(req.params['id'])
    res.status(200).json(await organizationService.join(id, req.credentials.user.id))
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
    const id = Number(req.params['id'])
    res.status(200).json(await organizationService.withdraw(id, req.credentials.user.id))
  } catch (error) {
    next(error)
  }
}