import {IFilmsParameters} from "interfaces/IFilmsParameters"
import {HTTP_METHOD, TMDB_FILM_TYPE, TMDB_SERVICE, VIDEO_PROVIDER, VIDEO_TYPE} from "utils/enums";
import {IFilm, IVideo} from "interfaces/ITMDB";

const axios = require('axios').default

export function getPopularFilms (params: IFilmsParameters) {
	return new Promise(async (resolve, reject) => {
		try {
			const tmdbURL = `${process.env.TMDB_API_HOST}/${TMDB_SERVICE.movie}/${TMDB_FILM_TYPE.popular}?api_key=${process.env.TMDB_API_KEY}&page=${params.page}&region=RU`
			const films = await axios({
				method: HTTP_METHOD.GET,
				url: tmdbURL
			})
			resolve(films)
		} catch (error) {
			reject(error)
		}
	})
}

export function getSelectedFilm (id: string): Promise<IFilm> {
	return new Promise(async (resolve, reject) => {
		console.log('find film: ' + id)
		try {
			const tmdbURL = `${process.env.TMDB_API_HOST}/${TMDB_SERVICE.movie}/${id}?api_key=${process.env.TMDB_API_KEY}&language=ru-RU`
			const { data } = await axios({
				method: HTTP_METHOD.GET,
				url: tmdbURL
			})
			resolve(data)
		} catch (error) {
			reject(error)
		}
	})
}

export function getFilmVideos (id: string): Promise<any> {
	return new Promise(async (resolve, reject) => {
		try {
			const tmdbURL = `${process.env.TMDB_API_HOST}/${TMDB_SERVICE.movie}/${id}/${TMDB_SERVICE.videos}?api_key=${process.env.TMDB_API_KEY}&language=ru-RU`
			const { data } = await axios({
				method: HTTP_METHOD.GET,
				url: tmdbURL
			})
			resolve(data)
		} catch (error) {
			reject(error)
		}
	})
}

export function getFilmTrailer (id: string): Promise<string> {
	return new Promise(async (resolve, reject) => {
		try {
			const data = await getFilmVideos(id)
			const videos: IVideo[] = data.results
			console.log(data)
			console.log(videos)
			const trailer = videos.find(video => video.type === VIDEO_TYPE.trailer)
			
			if (trailer) {
				switch (trailer.site) {
					case VIDEO_PROVIDER.youtube: {
						const url = `${process.env.YOUTUBE_TRAILER_URL}${trailer.key}`
						resolve(url)
						break
					}
					default: {
						resolve('')
						break
					}
				}
			} else {
				resolve('')
			}
		} catch (error) {
			console.log(error)
			reject(error)
		}
	})
}

