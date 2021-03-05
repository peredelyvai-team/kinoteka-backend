import express, { Request, Response } from "express"
import { PATH } from "~/utils/constants"
import uuid from 'uuid-random'
import {UserModel} from "db.users/users.model"
import {IUser, IUserCondition, IUserFilms} from "db.users/users.types"
import {MESSAGES} from "utils/messages";
import {authenticationCheck} from "~/middlewares/jwtAuth";
import {errorHandler, getTokenFromRequest} from "utils/helpers";
import {getPopularFilms} from "utils/tmdbApi";
import {IFilm, IFilmMinimize, ITMDBResponse, ITMDBResponseData} from "interfaces/ITMDB";
const filmsRouter = express.Router()
const jwt = require('jsonwebtoken')

function getCurrentUser (req: Request) {
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

function parseUserFilmsArray (data: ITMDBResponseData, userFilms: IUserFilms ): Array<IFilmMinimize> {
	return data.results.map(el => {
		return {
			id: el.id,
			overview: el.overview,
			title: el.title,
			poster_path: `${process.env.TMBD_COVER_URL}${el.poster_path}`,
			viewed: userFilms.viewedFilms.includes(el.id),
			to_watched: userFilms.toWatchIds.includes(el.id)
		}
	})
}

filmsRouter.get(PATH.films.popular, async (req: Request, res: Response) => {
	try {
		const user = await getCurrentUser(req) as IUser
		console.log(user)
		
		if (user) {
			
			const page: string = req.query.page?.toString() || '1'
			const popularFilms: any = await getPopularFilms({ page: parseInt(page), lang: 'ru-RU' })
			const data: ITMDBResponseData = popularFilms.data
			
			const viewedFilms = user.viewed_ids as number[]
			const toWatchIds = user.to_watch_ids as number[]
			console.log({ viewedFilms, toWatchIds })
			const parsedFilms = parseUserFilmsArray(data, { viewedFilms, toWatchIds })
			console.log(parsedFilms)
			if (parsedFilms) {
				return res.json({
					popularFilms: parsedFilms,
					page: data.page,
					totalResults: data.total_results,
					totalPages: data.total_pages
				})
			} else {
				return res.status(500).send(MESSAGES.UNABLE_TO_GET_FILMS)
			}
		} else {
			return res.status(401)
		}
	} catch (error) {
		errorHandler(error, res)
	}
})

export { filmsRouter }