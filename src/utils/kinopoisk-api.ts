import {IFilmsParameters} from "interfaces/IFilmsParameters";
import {HTTP_METHOD, KP_CATEGORY_TYPE, KP_SERVICE, KP_TYPE_OF_TOP, TMDB_FILM_TYPE, TMDB_SERVICE} from "utils/enums";
import axios from "axios";
import {IKPFilm, IKPVideos} from "interfaces/IKinopoisk";

export function getPopularFilms (params: IFilmsParameters) {
	return new Promise(async (resolve, reject) => {
		try {
			const version = 'v2.2'
			const url = `${process.env.KP_API_HOST}/${version}/${KP_SERVICE.films}/${KP_CATEGORY_TYPE.top}?type=${KP_TYPE_OF_TOP.TOP_100_POPULAR_FILMS}&page=${params.page}`
			const films = await axios({
				method: HTTP_METHOD.GET,
				url,
				headers: {
					'X-API-KEY': process.env.X_API_KEY
				}
			})
			resolve(films)
		} catch (error) {
			reject(error)
		}
	})
}

export function getFilmById (id: number) {
	return new Promise(async (resolve, reject) => {
		const version = 'v2.1'
		const appenders: string = 'RATING,POSTERS'
		try {
			const url = `${process.env.KP_API_HOST}/${version}/${KP_SERVICE.films}/${id}?append_to_response=${appenders}`
			const response = await axios({
				method: HTTP_METHOD.GET,
				url,
				headers: {
					'X-API-KEY': process.env.X_API_KEY
				}
			})
			resolve(response.data)
		} catch (error) {
			reject(error)
		}
	})
}

export function getFilmTrailer (id: number) {
	return new Promise(async (resolve, reject) => {
		try {
			const version = 'v2.1'
			const url = `${process.env.KP_API_HOST}/${version}/${KP_SERVICE.films}/${id}/videos`
			const response = await axios({
				method: HTTP_METHOD.GET,
				url,
				headers: {
					'X-API-KEY': process.env.X_API_KEY
				}
			})
			const videos = response.data
			if (Array.isArray(videos.trailers)) {
				const trailerPath = videos.trailers[0].url
				resolve(trailerPath)
			} else {
				resolve('')
			}
		} catch (error) {
			reject(error)
		}
	})
}