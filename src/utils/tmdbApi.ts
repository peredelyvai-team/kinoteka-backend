import {IFilmsParameters} from "interfaces/IFilmsParameters"
import {HTTP_METHOD, TMDB_FILM_TYPE, TMDB_SERVICE} from "utils/enums";

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

