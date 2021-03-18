import express, { Request, Response } from "express"
import { PATH } from "~/utils/constants"
import uuid from 'uuid-random'
import {UserModel} from "db.users/users.model"
import {IUser, IUserCondition} from "db.users/users.types"
import {MESSAGES} from "utils/messages";
import {authenticationCheck} from "~/middlewares/jwtAuth";
import {errorHandler, getCurrentUser} from "utils/helpers";
import {IUserFilmsChanges} from "interfaces/IUserModel";
import {log} from "utils/logger";
const bcrypt = require('bcrypt')
const userRouter = express.Router()


async function findExistUser (login: string): Promise<boolean> {
	const users = await UserModel.findOne({ login: login })
	console.log(users)
	return users !== null
}

async function cryptPassword (password: string) {
	const salt = await bcrypt.genSalt(10)
	return bcrypt.hash(password, salt)
}

export async function comparePassword (password: string, hash: string) {
	return bcrypt.compare(password, hash)
}

async function createUser (login: string, password: string, res: Response): Promise<Response> {
	const user: IUser = {
		user_id: uuid(),
		login,
		password: await cryptPassword(password),
		viewed_ids: [],
		to_watch_ids: [],
		friends: []
	}

	await UserModel.create(user)
	console.log(`User created: ${user.login}`)
	return res.status(200).send({
		login: user.login,
		user_id: user.user_id
	})
}

export async function findUserByCondition (condition: IUserCondition) {
	const user = await UserModel.findOne(condition)
	if (user) {
		return {
			login: user.login,
			user_id: user.user_id,
			viewed_ids: user.viewed_ids,
			to_watch_ids: user.to_watch_ids,
			friends: user.friends,
			password: user.password
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

userRouter.post(PATH.register, async (req: Request, res: Response) => {
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


userRouter.put(PATH.users.films.viewed, async (req: Request, res: Response) => {
	try {
		const user = await getCurrentUser(req) as IUser
		log.debug(MESSAGES.USER_RETRIEVED + user)

		if (user) {
			const changes = req.body.changes as IUserFilmsChanges
			if (Array.isArray(changes.added)) {
				log.debug(MESSAGES.ADDED_IDS + changes.added);
				log.debug(MESSAGES.REMOVED_IDS + changes.removed);
				UserModel.findOne({ login: user.login }, (err: any, doc: any) => {
					if (err) {
						log.error(err)
						return res.status(500)
					}

					doc.viewed_ids = Array.from(new Set([ ...doc.viewed_ids, ...changes.added ])) as number[]
					doc.viewed_ids = doc.viewed_ids.filter((id: number) => {
						return !changes.removed.includes(id);
					})
					
					log.debug(MESSAGES.VIEWED_FILMS + doc.viewed_ids);
					doc.save(() => {
						log.debug('document saved')
						return res.sendStatus(200)
					})
				})
			}
		} else {
			log.error(MESSAGES.USER_NOT_FOUND);
			return res.status(500).send(MESSAGES.USER_NOT_FOUND)
		}

	} catch (error) {
		log.error(error);
		errorHandler(error, res)
	}
})

export { userRouter }