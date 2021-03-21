import express, { Request, Response } from "express"
import { PATH } from "~/utils/constants"
import uuid from 'uuid-random'
import {UserModel} from "db.users/users.model"
import {IUser, IUserCondition, IUserFilms} from "db.users/users.types"
import {MESSAGES} from "utils/messages";
import {authenticationCheck} from "~/middlewares/jwtAuth";
import {errorHandler, getCurrentUser, getTokenFromRequest} from "utils/helpers";
import {log} from "utils/logger";
import {IKPFilm, IKPFilmFullData, IKPFilmMinimize, IKPFilmsResponseData} from "interfaces/IKinopoisk";
import {getPopularFilms, getFilmById, getFilmTrailer} from "utils/kinopoisk-api";
const filmsRouter = express.Router()

export function getPosterPath (poster_path: string): string {
	return `${process.env.TMBD_COVER_URL}${poster_path}`
}

function getBackdropPath (backdrop_path: string): string {
	return `${process.env.TMBD_BACKDROP_URL}${backdrop_path}`
}

function getFilmGenres (genres: { id: number, name: string }[] = []): string[] {
	return genres.map(genre => genre.name)
}

function parseUserFilmsArray (data: IKPFilmsResponseData, userFilms: IUserFilms ): Array<IKPFilmMinimize> {
	return data.films.map(el => {
		return {
			id: el.filmId,
			title: el.nameRu,
			poster_small: el.posterUrlPreview,
			viewed: userFilms.viewedFilms.includes(el.filmId),
			to_watched: userFilms.toWatchIds.includes(el.filmId),
			year: el.year,
			duration: el.filmLength,
			rating: el.rating
		}
	})
}

function setFullFilmInfo (id: number, film: IKPFilm, userFilms: IUserFilms): Promise<IKPFilmFullData> {
	return new Promise(async (resolve, reject) => {
		try {
			console.log(film)
			const filmData: IKPFilmFullData = {
				id: id,
				title: film.nameRu,
				overview: film.description as string,
				poster_small: film.posterUrlPreview,
				poster_big: film.posterUrl,
				viewed: userFilms.viewedFilms.includes(film.filmId) as boolean,
				to_watched: userFilms.toWatchIds.includes(film.filmId),
				
				release_date: film.premiereWorld as string,
				genres: film.genres?.map(el => el.genre),
				runtime: film.filmLength,
				trailer_path: await getFilmTrailer(id) as string
			}
			resolve(filmData)
		} catch (error) {
			console.log(error)
			reject(error)
		}
	})
}


// Получение популярных фильмов
filmsRouter.get(PATH.films.popular, authenticationCheck, async (req: Request, res: Response) => {
	try {
		const user = await getCurrentUser(req) as IUser
		log.debug(user)
		
		if (user) {
			
			const page: string = req.query.page?.toString() || '1'
			log.info(MESSAGES.ATTEMPT_GET_FILMS + 'popular')
			const popularFilms: any = await getPopularFilms({ page: parseInt(page) })
			const data: IKPFilmsResponseData = popularFilms.data
			
			const viewedFilms = user.viewed_ids as number[]
			const toWatchIds = user.to_watch_ids as number[]
			log.debug({ viewedFilms, toWatchIds })
			const parsedFilms = parseUserFilmsArray(data, { viewedFilms, toWatchIds })
			log.debug(parsedFilms)
			if (parsedFilms) {
				return res.json({
					popularFilms: parsedFilms,
					pagesCount: data.pagesCount
				})
			} else {
				log.error(MESSAGES.UNABLE_TO_GET_FILMS);
				return res.status(500).send(MESSAGES.UNABLE_TO_GET_FILMS)
			}
		} else {
			log.error(MESSAGES.BAD_AUTH_PARAMETERS)
			return res.status(401)
		}
	} catch (error) {
		log.error(error)
		errorHandler(error, res)
	}
})

// Получение фильма по идентификатору
filmsRouter.get(PATH.films.selected, authenticationCheck, async (req: Request, res: Response) => {
	try {
		const user = await getCurrentUser(req) as IUser
		log.debug(user)

		if (user) {
			log.debug(req.params)
			const id = parseInt(req.params.id)
			const response = await getFilmById(id) as any
			
			if (response) {
				const film: IKPFilm = response.data
				log.debug(film)
				
				if (film) {
					const viewedFilms = user.viewed_ids as number[]
					const toWatchIds = user.to_watch_ids as number[]
					log.debug({ viewedFilms, toWatchIds })
					const fullFilmInfo = await setFullFilmInfo(id, film, { viewedFilms, toWatchIds })
					return res.json(fullFilmInfo)
				} else {
					return res.status(500).send(MESSAGES.ERROR_FIND_FILM)
				}
			} else {
				log.error(MESSAGES.ERROR_UNDEFINED_FILM + id)
				res.status(400).send(MESSAGES.ERROR_UNDEFINED_FILM + id)
			}
		} else {
			return res.status(401)
		}
	} catch (error) {
		log.error(error)
		errorHandler(error, res)
	}
})


export { filmsRouter }