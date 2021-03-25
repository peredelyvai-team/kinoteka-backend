import {HTTP_METHOD, KP_CATEGORY_TYPE, KP_SERVICE, KP_STAFF_KEY, KP_TYPE_OF_TOP, KP_VIDEO_SITE} from "utils/enums";
import axios from "axios";
import {
	IKPFilmsResponseData,
	IKPSearchResult,
	IKPStaff,
	IKPStaffFullData,
	IFilmsParameters,
	IKPFilters,
	IKPFilm, IKPFilmMinimize
} from "interfaces/IKinopoisk";
import {log} from "utils/logger";
import {asyncForEach, getCurrentUser} from "utils/helpers";
import {IUser} from "db.users/users.types";
import { Response, Request } from "express"
import {MESSAGES} from "utils/messages";
import {getFilmsFromIds, getFullFilmsDataFromIds} from "~/routes/user";
import {filters} from "utils/filters";


export function getTopFilms (params: IFilmsParameters): Promise<IKPFilmsResponseData> {
	return new Promise<IKPFilmsResponseData>(async (resolve, reject) => {
		try {
			const version = 'v2.2'
			const url = `${process.env.KP_API_HOST}/${version}/${KP_SERVICE.films}/${KP_CATEGORY_TYPE.top}?type=${params.type}&page=${params.page}`
			const films = await axios({
				method: HTTP_METHOD.GET,
				url,
				headers: {
					'X-API-KEY': process.env.X_API_KEY
				}
			})
			resolve(films.data)
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
			const fullData = response.data
			const data = fullData.data
			data.rating = fullData.rating.rating
			resolve(data)
		} catch (error) {
			resolve(null)
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
			if (response) {
				const videos = response.data
				if (Array.isArray(videos.trailers)) {
					const trailerPath = videos.trailers.find((video: { site: KP_VIDEO_SITE }) => video.site === KP_VIDEO_SITE.KINOPOISK_WIDGET).url
					resolve(trailerPath)
				} else {
					resolve('')
				}
			} else {
				resolve('')
			}
		} catch (error) {
			resolve('')
		}
	})
}

export function searchFilmsByKeyword (keyword: string, page: number): Promise<IKPSearchResult> {
	return new Promise<IKPSearchResult>(async (resolve, reject) => {
		try {
			const version = 'v2.1'
			const url = `${process.env.KP_API_HOST}/${version}/${KP_SERVICE.films}/search-by-keyword?keyword=${keyword}&page=${page}`
			log.debug(url)
			const { data } = await axios({
				method: HTTP_METHOD.GET,
				url,
				headers: {
					'X-API-KEY': process.env.X_API_KEY
				}
			})
			resolve(data)
		} catch (error) {
			reject(error)
		}
	})
}

export function getFilmBackdrop (id: number): Promise<string> {
	return new Promise<string>(async (resolve) => {
		try {
			const version = 'v2.1'
			const url = `${process.env.KP_API_HOST}/${version}/${KP_SERVICE.films}/${id}/frames`
			log.debug(url)
			const { data } = await axios({
				method: HTTP_METHOD.GET,
				url,
				headers: {
					'X-API-KEY': process.env.X_API_KEY
				}
			})
			const images: { image: string, preview: string }[] = data.frames
			
			if (images?.length) {
				resolve(images[0].image)
			} else {
				resolve('')
			}
			
		} catch (error) {
			log.error(error)
			resolve('')
		}
	})
}

export function getFilmStaff (id: number): Promise<IKPStaff[]> {
	return new Promise<IKPStaff[]>(async (resolve) => {
		try {
			const version = 'v1'
			const url = `${process.env.KP_API_HOST}/${version}/${KP_SERVICE.staff}?filmId=${id}`
			log.debug(url)
			const { data } = await axios({
				method: HTTP_METHOD.GET,
				url,
				headers: {
					'X-API-KEY': process.env.X_API_KEY
				}
			})
			const totalStaff: IKPStaffFullData[] = data
			
			const staff: IKPStaff[] = []
			
			let actorsCount = 0
			let actorsLimit = 10
			totalStaff.forEach(el => {
				if (el.professionKey === KP_STAFF_KEY.DIRECTOR || el.professionKey === KP_STAFF_KEY.ACTOR) {
					staff.push({
						name: el.nameRu,
						description: el.description,
						posterUrl: el.posterUrl,
						profession: el.professionText
					} as IKPStaff)
					
					if (actorsCount <= actorsLimit && el.professionKey === KP_STAFF_KEY.ACTOR) {
						actorsCount++
					}
				}
			})
			resolve(staff)
		} catch (error) {
			log.error(error)
			resolve([] as IKPStaff[])
		}
	})
}


export function getFilters (): Promise<IKPFilters> {
	return new Promise<IKPFilters>(async (resolve, reject) => {
		try {
			const version = 'v2.1'
			const url = `${process.env.KP_API_HOST}/${version}/${KP_SERVICE.films}/filters`
			log.debug(url)
			const { data } = await axios({
				method: HTTP_METHOD.GET,
				url,
				headers: {
					'X-API-KEY': process.env.X_API_KEY
				}
			})
			resolve(data)
		} catch (error) {
			reject(error)
		}
	})
}

export function searchByFilters (query: string): Promise<IKPFilmsResponseData> {
	return new Promise<IKPFilmsResponseData>(async (resolve, reject) => {
		try {
			const version = 'v2.1'
			const url = `${process.env.KP_API_HOST}/${version}/${KP_SERVICE.films}/search-by-filters?${query}&type=${KP_CATEGORY_TYPE.film}`
			log.debug(url)
			const { data } = await axios({
				method: HTTP_METHOD.GET,
				url,
				headers: {
					'X-API-KEY': process.env.X_API_KEY
				}
			})
			resolve(data as IKPFilmsResponseData)
		} catch (error) {
			reject(error)
		}
	})
}

export function getRecommendedUserFilms (req: Request): Promise<IKPFilm[]> {
	return new Promise<IKPFilm[]>(async (resolve, reject) => {
		try {
			const user = await getCurrentUser(req) as IUser
			
			if (user) {
				
				const userFilmIds: number[] = Array.from(new Set([ ...user.viewed_ids, ...user.to_watch_ids ]))
				
				if (userFilmIds.length) {
				
					const films = await getFullFilmsDataFromIds(userFilmIds)
					
					const years = Array.from(new Set(films.map(film => film.year))).sort()
					const ratings = Array.from(new Set(films.map(film => film.rating))).sort()
					
					const yearsFrom = years[0]
					const yearsTo = years[years.length - 1]
					
					const ratingsTo: number = parseInt(ratings[ratings.length - 1]) + 1
					const ratingFrom = ratingsTo - 2
					
					const countries = films.map(film => {
						return film.countries.map((item: { country: string }) => item.country)
					}).flat()
					const countryIds = countries.map(country => filters.countries.find(item => item.country === country)?.id)
					
					const genres = films.map(film => {
						return film.genres.map((item: { genre: string }) => item.genre)
					}).flat()
					const genreIds = genres.map(genre => filters.genres.find(item => item.genre === genre)?.id)
					
					const recommendedFilms: IKPFilm[] = []
					const filmsCount = 20
					
					await asyncForEach(countryIds, async (country) => {
						await asyncForEach(genreIds, async (genre) => {
							if (recommendedFilms.length >= filmsCount) {
								return
							}
							const query: string = `country=${country}&genre=${genre}&ratingFrom=${ratingFrom}&ratingTo=${ratingsTo}&yearsFrom=${yearsFrom}&yearsTo=${yearsTo}&page=1&`
							log.debug(query)
							const data: IKPFilmsResponseData = await searchByFilters(query)
							const films = data.films as IKPFilm[]
							
							if (recommendedFilms.length < filmsCount) {
								const searchedFilms = films.slice(0, 2)
								const recommendedFilmIds = recommendedFilms.map(film => film.filmId)
								searchedFilms.forEach(film => {
									if (!recommendedFilmIds.includes(film.filmId)) {
										recommendedFilms.push(film)
									}
								})
							} else {
								resolve(recommendedFilms.slice(0, filmsCount))
							}
						})
					})
					resolve(recommendedFilms)
				} else {
					reject(MESSAGES.ERROR_LITTLE_FILMS_COUNT)
				}
			} else {
				reject(MESSAGES.ERROR_USER_NOT_FOUND)
			}
			
		} catch (error) {
			reject(error)
		}
	})
}