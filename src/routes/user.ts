import express, { Request, Response } from "express"
import { PATH } from "~/utils/constants"
import uuid from 'uuid-random'
import {UserModel} from "db.users/users.model"
import {IUser, IUserCondition} from "db.users/users.types"
import {MESSAGES} from "utils/messages";
import {authenticationCheck} from "~/middlewares/jwtAuth";
const userRouter = express.Router()


async function findExistUser (login: string): Promise<boolean> {
	const users = await UserModel.findOne({ login: login })
	console.log(users)
	return users !== null
}

async function createUser (login: string, password: string, res: Response): Promise<Response> {
	const user: IUser = {
		user_id: uuid(),
		login,
		password,
		viewed_ids: [],
		to_watch_ids: [],
		friends: []
	}

	console.log(user)

	await UserModel.create(user)
	console.log(`User created: ${user.login}`)
	return res.status(200).send(user)
}

export async function findUserByCondition (condition: IUserCondition) {
	const user = await UserModel.findOne(condition)
	if (user) {
		return {
			login: user.login,
			user_id: user.user_id,
			viewed_ids: user.viewed_ids,
			to_watch_ids: user.to_watch_ids,
			friends: user.friends
		}
	} else {
		return null
	}
}

function validateUserAndSend (user: IUser | null, res: Response) {
	if (user) {
		return res.status(200).send(user)
	} else {
		res.status(400).send(MESSAGES.USER_NOT_FOUND)
	}
}

userRouter.post(PATH.user, async (req: Request, res: Response) => {
    try {
			const { login, password } = req.body

			if (login && password) {
				const userExists = await findExistUser(login)
				if (userExists) {
					res.status(400).send(MESSAGES.USER_EXISTS)
				} else {
					await createUser(login, password, res)
				}
			} else {
				return res.status(403).send(MESSAGES.BAD_AUTH_PARAMETERS)
			}
    } catch (error) {
			console.log(error)
			return res.status(500)
    }
})

userRouter.get(PATH.user, authenticationCheck, async (req: Request, res: Response) => {
	try {
		const login = req.query.login?.toString() || ''
		const user_id = req.query.user_id?.toString() || ''

		console.log(process.env.NODE_ENV)
		console.log(`login: ${login}`)
		console.log(`user_id: ${user_id}`)
		if (login) {
			const user = await findUserByCondition({ login })
			validateUserAndSend(user, res)
		} else {
			if (user_id) {
				const user = await findUserByCondition({ user_id })
				validateUserAndSend(user, res)
			} else {
				return res.status(400).send(MESSAGES.USER_INFO_NOT_PROVIDED)
			}
		}
	} catch (error) {
		console.log(error)
		return res.status(500)
	}
})

export { userRouter }