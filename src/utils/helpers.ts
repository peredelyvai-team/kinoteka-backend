import { Response, Request } from "express"

export function errorHandler (error: string, res: Response, code: number = 500) {
  console.log(error)
  res.status(500).send(error)
}

export function getTokenFromRequest (req: Request): string | null {
	const header = req.headers.authorization as string
	const token = header.split(' ')[1]
	return token.length ? token : null
}