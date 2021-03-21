import {IFilmsParameters} from "interfaces/IFilmsParameters";
import {HTTP_METHOD, KP_CATEGORY_TYPE, KP_SERVICE, KP_TYPE_OF_TOP, TMDB_FILM_TYPE, TMDB_SERVICE} from "utils/enums";
import axios from "axios";

export function getPopularFilms (params: IFilmsParameters) {
	return new Promise(async (resolve, reject) => {
		try {
			const url = `${process.env.KP_API_HOST}/${KP_SERVICE.films}/${KP_CATEGORY_TYPE.top}?type=${KP_TYPE_OF_TOP.TOP_100_POPULAR_FILMS}&page=${params.page}`
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