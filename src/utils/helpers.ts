import { Response } from "express"

export function errorHandler (error: string, res: Response, code: number = 500) {
  console.log(error)
  res.status(500).send(error)
}