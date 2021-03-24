import {HTTP_METHOD, KP_CATEGORY_TYPE, KP_SERVICE, KP_STAFF_KEY, KP_TYPE_OF_TOP, KP_VIDEO_SITE} from "utils/enums";
import axios from "axios";
import {IKPFilmsResponseData, IKPSearchResult, IKPStaff, IKPStaffFullData, IFilmsParameters, IKPFilterParams, IKPFilters} from "interfaces/IKinopoisk";
import {log} from "utils/logger";


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
			
			const types = Object.values(KP_STAFF_KEY)
			const staff: IKPStaff[] = []
			
			totalStaff.forEach(el => {
				if (types.includes(el.professionKey as KP_STAFF_KEY)) {
					staff.push({
						name: el.nameRu,
						description: el.description,
						posterUrl: el.posterUrl,
						profession: el.professionText
					} as IKPStaff)
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