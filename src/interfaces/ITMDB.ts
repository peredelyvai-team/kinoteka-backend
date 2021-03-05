import {VIDEO_TYPE} from "utils/enums";

export interface ITMDBResponse {
	data: object
}

export interface IFilmMinimize {
	id: number,
	title: string,
	overview: string,
	poster_path: string,
	viewed: boolean,
	to_watched: boolean
}

export interface IFilmData {
	backdrop_path: string,
	release_date: string,
	tagline: string,
	genres: string[],
	runtime: number,
	trailer_path: string,
	
	id: number,
	title: string,
	overview: string,
	poster_path: string,
	viewed: boolean,
	to_watched: boolean
}

export interface IFilm {
	adult: boolean,
	backdrop_path: string,
	genre_ids: number[],
	genres?: { id: number, name: string }[]
	id: number,
	original_language: string,
	original_title: string,
	overview: string,
	popularity: number,
	poster_path: string,
	release_date: string,
	title: string,
	video: boolean,
	tagline: string,
	vote_average?: number,
	vote_count?: number,
	runtime: number
}

export interface ITMDBResponseData {
	page: string,
	results: Array<IFilm>,
	total_pages: number,
	total_results: number
}

export interface IVideo {
	id: string,
	iso_639_1: string,
	iso_3166_1: string,
	key: string,
	name: string,
	site: string,
	size: number,
	type: VIDEO_TYPE
}