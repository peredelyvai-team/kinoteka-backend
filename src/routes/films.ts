import express, { Request, Response } from "express"
import { PATH } from "~/utils/constants"
import uuid from 'uuid-random'
import {UserModel} from "db.users/users.model"
import {IUser, IUserCondition, IUserFilms} from "db.users/users.types"
import {MESSAGES} from "utils/messages";
import {authenticationCheck} from "~/middlewares/jwtAuth";
import {errorHandler, getCurrentUser, getTokenFromRequest} from "utils/helpers";
import {getFilmTrailer, getPopularFilms, getSelectedFilm} from "utils/tmdbApi";
import {IFilm, IFilmData, IFilmMinimize, ITMDBResponse, ITMDBResponseData} from "interfaces/ITMDB";
const filmsRouter = express.Router()

function getPosterPath (poster_path: string): string {
	return `${process.env.TMBD_COVER_URL}${poster_path}`
}

function getBackdropPath (backdrop_path: string): string {
	return `${process.env.TMBD_BACKDROP_URL}${backdrop_path}`
}

function getFilmGenres (genres: { id: number, name: string }[] = []): string[] {
	return genres.map(genre => genre.name)
}

function parseUserFilmsArray (data: ITMDBResponseData, userFilms: IUserFilms ): Array<IFilmMinimize> {
	return data.results.map(el => {
		return {
			id: el.id,
			overview: el.overview,
			title: el.title,
			poster_path: getPosterPath(el.poster_path),
			viewed: userFilms.viewedFilms.includes(el.id),
			to_watched: userFilms.toWatchIds.includes(el.id)
		}
	})
}

function setFullFilmInfo (id: string, film: IFilm, userFilms: IUserFilms): Promise<IFilmData> {
	return new Promise(async (resolve, reject) => {
		try {
			console.log(film)
			const filmData: IFilmData = {
				id: parseInt(id),
				title: film.title,
				overview: film.overview,
				poster_path: getPosterPath(film.poster_path),
				viewed: userFilms.viewedFilms.includes(film.id),
				to_watched: userFilms.toWatchIds.includes(film.id),
				tagline: film.tagline,
				
				backdrop_path: getBackdropPath(film.backdrop_path),
				release_date: film.release_date,
				genres: getFilmGenres(film.genres),
				runtime: film.runtime,
				trailer_path: await getFilmTrailer(id)
			}
			resolve(filmData)
		} catch (error) {
			console.log(error)
			reject(error)
		}
	})
}

filmsRouter.get(PATH.films.popular, authenticationCheck, async (req: Request, res: Response) => {
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


filmsRouter.get(PATH.films.selected, authenticationCheck, async (req: Request, res: Response) => {
	try {
		const user = await getCurrentUser(req) as IUser
		console.log(user)
		
		if (user) {
			console.log(req.params)
			const id = req.params.id
			const film = await getSelectedFilm(id) as IFilm
			console.log(film)
			
			if (film) {
				const viewedFilms = user.viewed_ids as number[]
				const toWatchIds = user.to_watch_ids as number[]
				console.log({ viewedFilms, toWatchIds })
				const fullFilmInfo = await setFullFilmInfo(id, film, { viewedFilms, toWatchIds })
				return res.json(fullFilmInfo)
			} else {
				return res.status(500).send(MESSAGES.ERROR_FIND_FILM)
			}
		} else {
			return res.status(401)
		}
	} catch (error) {
		errorHandler(error, res)
	}
})


export { filmsRouter }