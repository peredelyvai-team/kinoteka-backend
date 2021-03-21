import express, { Request, Response } from "express"
import { PATH } from "~/utils/constants"
import uuid from 'uuid-random'
import {UserModel} from "db.users/users.model"
import {IUser, IUserCondition} from "db.users/users.types"
import {MESSAGES} from "utils/messages";
import {authenticationCheck} from "~/middlewares/jwtAuth";
import {asyncForEach, errorHandler, getCurrentUser} from "utils/helpers";
import {IUserFilmsChanges} from "interfaces/IUserModel";
import {log} from "utils/logger";
import {IFilm, IFilmMinimize} from "interfaces/ITMDB";
import {getSelectedFilm} from "utils/tmdbApi";
import {getPosterPath} from "~/routes/films";
const bcrypt = require('bcrypt')
const userRouter = express.Router()


// Поиск существующего польлзователя
async function findExistUser (login: string): Promise<boolean> {
	const users = await UserModel.findOne({ login: login })
	console.log(users)
	return users !== null
}

// Шифрование пароля
async function cryptPassword (password: string) {
	const salt = await bcrypt.genSalt(10)
	return bcrypt.hash(password, salt)
}

// Сравнивание зашифрованного и передаваемого пароля
export async function comparePassword (password: string, hash: string) {
	return bcrypt.compare(password, hash)
}
// Добавление пользователя в базу данных
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

// Получение пользователя по параметрам
export async function findUserByCondition (condition: IUserCondition): Promise<IUser> {
	return new Promise<IUser>(async (resolve, reject) => {
		try {
			const user = await UserModel.findOne(condition)
			if (user) {
				resolve({
					login: user.login,
					user_id: user.user_id,
					viewed_ids: user.viewed_ids,
					to_watch_ids: user.to_watch_ids,
					friends: user.friends,
					password: user.password
				})
			} else {
				log.error(MESSAGES.USER_NOT_FOUND)
				reject(MESSAGES.USER_NOT_FOUND)
			}
		} catch (error) {
			log.error(error)
			reject(error)
		}
	})
}

// Получение данных о фильмах через их идентификаторы
export async function getFilmsFromIds (ids: number[], user: IUser): Promise<IFilmMinimize[]> {
	return new Promise(async (resolve, reject) => {
		try {
			let minimizedFilms: IFilmMinimize[] = []
			
			await asyncForEach (ids, async (id) => {
				const film = await getSelectedFilm(id) as IFilm
				if (film) {
					log.debug(MESSAGES.FILM + film)
					minimizedFilms.push({
						id: id,
						title: film.title,
						overview: film.overview,
						poster_path: getPosterPath(film.poster_path),
						viewed: user.viewed_ids?.includes(id) || false,
						to_watched: user.to_watch_ids?.includes(id) || false
					})
				} else {
					log.error(MESSAGES.ERROR_FILM_PARSE)
				}
			})
			log.debug(MESSAGES.FILMS + minimizedFilms)
			resolve(minimizedFilms)
		} catch (error) {
			log.error(error)
			reject(error)
		}
	})
}


// Регистрация пользователя
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


// Изменение списка просмотренных фильмов
userRouter.put(PATH.users.films.viewed, async (req: Request, res: Response) => {
	try {
		const user = await getCurrentUser(req) as IUser
		const userId: string = req.params.id
		
		if (user.user_id !== userId) {
			return res.status(400).send(MESSAGES.ERROR_USER_ID)
		}
		
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

userRouter.get(PATH.users.films.viewed, async (req: Request, res: Response) => {
	try {
		const userId = req.params.id
		
		if (userId) {
			log.debug(MESSAGES.ATTEMPT_GET_FILMS + 'viewed')
			log.debug(MESSAGES.USER_ID + userId)
			
			log.info(MESSAGES.ATTEMPT_GET_USER + userId)
			const user: IUser = await findUserByCondition({ user_id: userId }) as IUser
			
			if (user) {
				log.debug(MESSAGES.USER_RETRIEVED + user)
				
				const viewed_ids: number[] = user.viewed_ids || []
				log.debug(MESSAGES.FILM_IDS + viewed_ids)
				
				const viewedFilms = await getFilmsFromIds(viewed_ids, user)
				
				if (Array.isArray(viewedFilms)) {
					return res.status(200).json(viewedFilms)
				} else {
					log.error(MESSAGES.ERROR_GET_VIEWED_FILMS)
					return res.status(500).send(MESSAGES.ERROR_GET_VIEWED_FILMS)
				}
				
			} else {
				log.error(MESSAGES.ERROR_FIND_USER)
				return res.status(400).send(MESSAGES.ERROR_FIND_USER)
			}
			
		} else {
			log.error(MESSAGES.ERROR_USER_ID_NOT_SET)
			return res.status(400).send(MESSAGES.ERROR_USER_ID_NOT_SET)
		}
		
	} catch (error) {
		log.error(error);
		log.error(MESSAGES.ERROR_GET_VIEWED_FILMS)
		errorHandler(error, res)
	}
})

export { userRouter }