import { Response, Request } from "express"
import {UserModel} from "db.users/users.model"
import {log} from "utils/logger";
import {MESSAGES} from "utils/messages";
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
				jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err: any, { login }: any) => {
					if (err) {
						log.error(err)
						reject(err)
					} else {
						log.debug(login)
						const user = await UserModel.findOne({ login })
						log.debug(user)
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

export interface ILoopCallback {

}

export async function asyncForEach (array: any[], callback: (item: any, index?: number, array?: any[]) => void) {
	for (let i = 0; i < array.length; i++) {
		await callback(array[i], i, array)
	}
}

export function checkToken (req: Request) {
	const header = req.headers.authorization
	if (header) {
		const token = header.split(' ')[1]
		let isValid = false
		jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err: any, user: any) => {
			if (err) {
				log.debug(MESSAGES.TOKEN_INVALID)
				isValid = false
			} else {
				log.debug(user)
				log.debug(MESSAGES.TOKEN_VALID)
				isValid = true
			}
		})
		return isValid
	} else {
		return false
	}
}
