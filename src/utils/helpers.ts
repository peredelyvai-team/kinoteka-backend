import { Response, Request } from "express"
import {UserModel} from "db.users/users.model"
const jwt = require('jsonwebtoken')

export function errorHandler (error: string, res: Response, code: number = 500) {
  console.log(error)
  res.status(500).send(error)
}

export function getTokenFromRequest (req: Request): string | null {
	const header = req.headers.authorization as string
	const token = header.split(' ')[1]
	return token.length ? token : null
}

export function getCurrentUser (req: Request) {
	return new Promise ((resolve, reject) => {
		try {
			const token = getTokenFromRequest(req)
			if (token) {
				jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err: any, { login }: any) => {
					if (err) {
						console.log(err)
						reject(err)
					} else {
						console.log(login)
						const user = UserModel.findOne({ login })
						console.log(user)
						resolve(user)
					}
				})
			} else {
				reject()
			}
		} catch (error) {
			reject(error)
		}
	})
}
