import express, {Request, Response} from "express"
import {PATH} from "~/utils/constants"
import {IUser, IUserFilms} from "db.users/users.types"
import {MESSAGES} from "utils/messages";
import {authenticationCheck} from "~/middlewares/jwtAuth";
import {checkToken, errorHandler, getCurrentUser} from "utils/helpers";
import {log} from "utils/logger";
import {IKPFilm, IKPFilmFullData, IKPFilmMinimize, IKPFilmsResponseData} from "interfaces/IKinopoisk";
import {getFilmById, getFilmTrailer, getPopularFilms, getTopFilms} from "utils/kinopoisk-api";
import {KP_TYPE_OF_TOP} from "utils/enums";

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

function parseFilmsArray (films: IKPFilm[], userFilms: IUserFilms ): Array<IKPFilmMinimize> {
	return films.map(el => {
		return {
			id: el.filmId,
			title: el.nameRu,
			poster_small: el.posterUrlPreview,
			viewed: userFilms.viewedFilms.includes(el.filmId),
			to_watched: userFilms.toWatchIds.includes(el.filmId),
			year: el.year,
			duration: el.filmLength,
			rating: el.rating as string
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
				trailer_path: await getFilmTrailer(id) as string,
				
				rating: film.rating,
				facts: film.facts
			}
			resolve(filmData)
		} catch (error) {
			console.log(error)
			reject(error)
		}
	})
}

async function getFilms (req: Request, viewed_ids: number[], to_watch_ids: number[]): Promise<IKPFilmsResponseData> {
	return new Promise(async (resolve, reject) => {
		try {
			const page: string = req.query.page?.toString() || '1'
			const type: KP_TYPE_OF_TOP = req.query.type?.toString() as KP_TYPE_OF_TOP || KP_TYPE_OF_TOP.TOP_100_POPULAR_FILMS
			
			if (Object.values(KP_TYPE_OF_TOP).includes(type)) {
				log.info(MESSAGES.ATTEMPT_GET_FILMS + type)
				const data: IKPFilmsResponseData = await getTopFilms({ page: parseInt(page), type })
				
				const viewedFilms = viewed_ids as number[]
				const toWatchIds = to_watch_ids as number[]
				log.debug({ viewedFilms, toWatchIds })
				
				const filmsMinimized: IKPFilmMinimize[] = parseFilmsArray(data.films as IKPFilm[], { viewedFilms, toWatchIds })
				resolve({ films: filmsMinimized, pagesCount: data.pagesCount })
			} else {
				reject(MESSAGES.ERROR_UNDEFINED_FILM_TYPE)
			}
		} catch (error) {
			reject(error)
		}
	})
}


async function getAuthUserFilms (req: Request): Promise<IKPFilmsResponseData> {
	return new Promise<IKPFilmsResponseData>(async (resolve, reject) => {
		try {
			const user = await getCurrentUser(req) as IUser
			log.debug(user)
			let data: IKPFilmsResponseData
			if (user) {
				data = await getFilms(req, user.viewed_ids, user.to_watch_ids)
			} else {
				data = await getFilms(req, [], [])
			}
			resolve({ films: data.films, pagesCount: data.pagesCount })
		} catch (error) {
			log.error(error)
			reject(error)
		}
	})
}


// Получение списка фильмов по параметру
filmsRouter.get(PATH.films.get, async (req: Request, res: Response) => {
	try {
		const isAuthorized: boolean = checkToken(req) || false
		
		log.debug(MESSAGES.USER_AUTHORIZED + isAuthorized)
		let filmsData: IKPFilmsResponseData
		if (isAuthorized) {
			filmsData = await getAuthUserFilms(req)
		} else {
			filmsData = await getFilms(req, [], [])
		}
		if (filmsData) {
			return res.json({
				popularFilms: filmsData.films,
				pagesCount: filmsData.pagesCount
			})
		} else {
			log.error(MESSAGES.UNABLE_TO_GET_FILMS);
			return res.status(500).send(MESSAGES.UNABLE_TO_GET_FILMS)
		}
	} catch (error) {
		log.error(error)
		errorHandler(error, res)
	}
})

async function getSingleFilm (req: Request, viewed_ids: number[], to_watch_ids: number[]): Promise<IKPFilmFullData> {
	return new Promise<IKPFilmFullData>(async (resolve, reject) => {
		try {
			log.debug(req.params)
			const id = parseInt(req.params.id)
			const data = await getFilmById(id) as any
			if (data) {
				const film: IKPFilm = data
				log.debug(film)
				if (film) {
					const viewedFilms = viewed_ids as number[]
					const toWatchIds = to_watch_ids as number[]
					log.debug({ viewedFilms, toWatchIds })
					const fullFilmInfo: IKPFilmFullData = await setFullFilmInfo(id, film, { viewedFilms, toWatchIds })
					resolve(fullFilmInfo)
				} else {
					reject(MESSAGES.ERROR_UNDEFINED_FILM + id)
				}
			} else {
				log.error(MESSAGES.ERROR_UNDEFINED_FILM + id)
				reject(MESSAGES.ERROR_UNDEFINED_FILM + id)
			}
		} catch (error) {
			log.error(error)
			reject(error)
		}
	})
}

function getAuthUserSingleFilm (req: Request): Promise<IKPFilmFullData> {
	return new Promise<IKPFilmFullData>(async (resolve, reject) => {
		try {
			const user = await getCurrentUser(req) as IUser
			log.debug(user)
			let film: IKPFilmFullData

			if (user) {
				film = await getSingleFilm(req, user.viewed_ids, user.to_watch_ids)
			} else {
				film = await getSingleFilm(req, [], [])
			}
			resolve(film)
		} catch (error) {
			log.error(error)
			reject(MESSAGES.ERROR_FIND_FILM)
		}
	})
}

// Получение фильма по идентификатору
filmsRouter.get(PATH.films.selected, async (req: Request, res: Response) => {
	try {
		const isAuthorized: boolean = checkToken(req) || false
		log.debug(MESSAGES.USER_AUTHORIZED + isAuthorized)
		let filmsData: IKPFilmFullData
		if (isAuthorized) {
			filmsData = await getAuthUserSingleFilm(req)
		} else {
			filmsData = await getSingleFilm(req, [], [])
		}
		res.json(filmsData)
	} catch (error) {
		log.error(error)
		errorHandler(error, res)
	}
})


export { filmsRouter }