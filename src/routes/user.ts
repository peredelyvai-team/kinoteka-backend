import express, { Request, Response } from "express"
import { PATH } from "~/utils/constants"
import uuid from 'uuid-random'
import {UserModel} from "db.users/users.model"
import {IUser, IUserCondition} from "db.users/users.types"
import {MESSAGES} from "utils/messages";
import {authenticationCheck} from "~/middlewares/jwtAuth";
import {asyncForEach, checkToken, errorHandler, getCurrentUser} from "utils/helpers";
import {IUserFilmsChanges} from "interfaces/IUserModel";
import {log} from "utils/logger";
import {IKPFilm, IKPFilmMinimize, IKPFilmsResponseData} from "interfaces/IKinopoisk";
import {getFilmById, getFilters, getRecommendedUserFilms, searchByFilters} from "utils/kinopoisk-api";
import {parseFilmsArray} from "~/routes/films";
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


export async function getFullFilmsDataFromIds (ids: number[]): Promise<IKPFilm[]> {
	return new Promise(async (resolve, reject) => {
		try {
			let films: IKPFilm[] = []
			
			await asyncForEach (ids, async (id) => {
				const film = await getFilmById(id) as IKPFilm
				log.debug(film)
				
				if (film) {
					log.debug(MESSAGES.FILM + film)
					films.push(film)
				} else {
					log.error(MESSAGES.ERROR_FILM_PARSE)
				}
			})
			log.debug(MESSAGES.FILMS + films)
			resolve(films)
		} catch (error) {
			reject(error)
		}
	})
}

// Получение данных о фильмах через их идентификаторы
export async function getFilmsFromIds (ids: number[], user: IUser): Promise<IKPFilmMinimize[]> {
	return new Promise(async (resolve, reject) => {
		try {
			let minimizedFilms: IKPFilmMinimize[] = []
			
			await asyncForEach (ids, async (id) => {
				const film = await getFilmById(id) as any
				log.debug(film)
				
				if (film) {
					log.debug(MESSAGES.FILM + film)
					minimizedFilms.push({
						id,
						poster_small: film.posterUrlPreview,
						year: film.year,
						duration: film.filmLength,
						rating: film.rating,
						title: film.nameRu,
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
userRouter.put(PATH.users.films.viewed, authenticationCheck, async (req: Request, res: Response) => {
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


// Получение списка просмотренных фильмов
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



// Изменение списка просмотренных фильмов
userRouter.put(PATH.users.films.to_watch, authenticationCheck, async (req: Request, res: Response) => {
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
					
					doc.to_watch_ids = Array.from(new Set([ ...doc.viewed_ids, ...changes.added ])) as number[]
					doc.to_watch_ids = doc.to_watch_ids.filter((id: number) => {
						return !changes.removed.includes(id);
					})
					
					log.debug(MESSAGES.TO_WATCHED_FILMS + doc.to_watch_ids);
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


userRouter.get(PATH.films.filters, async (req: Request, res: Response) => {
	try {
		const data = await getFilters()
		return res.json(data)
	} catch (error) {
		log.error(error)
		return res.status(500).send(MESSAGES.ERROR_GET_FILTERS)
	}
})

userRouter.get(PATH.films.searchByFilters, async (req: Request, res: Response) => {
	try {
		const query: string = req.originalUrl.slice(req.originalUrl.indexOf('?') + 1)
		log.debug(query)
		
		const data = await searchByFilters(query) as IKPFilmsResponseData
		
		const isAuthorized: boolean = checkToken(req) || false
		log.debug(MESSAGES.USER_AUTHORIZED + isAuthorized)
		let films: IKPFilmMinimize[]
		if (isAuthorized) {
			
			const user = await getCurrentUser(req) as IUser
			
			if (user) {
				films = parseFilmsArray(data.films as IKPFilm[], { viewedFilms: user.viewed_ids, toWatchIds: user.to_watch_ids})
			} else {
				films = parseFilmsArray(data.films as IKPFilm[], { viewedFilms: [], toWatchIds: [] })
			}
		} else {
			films = parseFilmsArray(data.films as IKPFilm[], { viewedFilms: [], toWatchIds: [] }) as IKPFilmMinimize[]
		}
		
		return res.json({
			pagesCount: data.pagesCount,
			films
		} as IKPFilmsResponseData)
	} catch (error) {
		log.error(error)
		return res.status(500)
	}
})


// Получение списка просмотренных фильмов
userRouter.get(PATH.users.films.to_watch, async (req: Request, res: Response) => {
	try {
		const userId = req.params.id
		
		if (userId) {
			log.debug(MESSAGES.ATTEMPT_GET_FILMS + 'to watch')
			log.debug(MESSAGES.USER_ID + userId)
			
			log.info(MESSAGES.ATTEMPT_GET_USER + userId)
			const user: IUser = await findUserByCondition({ user_id: userId }) as IUser
			
			if (user) {
				log.debug(MESSAGES.USER_RETRIEVED + user)
				
				const to_watch_ids: number[] = user.to_watch_ids || []
				log.debug(MESSAGES.FILM_IDS + to_watch_ids)
				
				const toWatchFilms = await getFilmsFromIds(to_watch_ids, user)
				
				if (Array.isArray(toWatchFilms)) {
					return res.status(200).json(toWatchFilms)
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
		log.error(MESSAGES.ERROR_GET_TO_WATCH_FILMS)
		errorHandler(error, res)
	}
})

userRouter.get(PATH.users.films.recommended, authenticationCheck, async (req: Request, res: Response) => {
	try {
		const user = await getCurrentUser(req) as IUser
		log.debug(user)
		if (user) {
			const recommendedFilms = await getRecommendedUserFilms(req)
			const filmsMinimized: IKPFilmMinimize[] = parseFilmsArray(recommendedFilms, { viewedFilms: user.viewed_ids, toWatchIds: user.to_watch_ids })
			return res.json({
				recommendedFilms: filmsMinimized
			})
		} else {
			log.error(MESSAGES.ERROR_USER_NOT_FOUND)
			return res.status(403).send(MESSAGES.ERROR_USER_NOT_FOUND)
		}
	} catch (error) {
		log.error(error)
		return res.status(500).send(error)
	}
})



export { userRouter }