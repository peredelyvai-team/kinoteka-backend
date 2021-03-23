import {KP_VIDEO} from "utils/enums";
import {getFilmTrailer} from "utils/kinopoisk-api";


export interface IKPFilm {
	filmId: number,
	nameRu: string,
	nameEn: string,
	year: string,
	filmLength: string,
	countries: { country: string }[],
	genres: { genre: string }[],
	rating: string,
	facts: string[],
	ratingVoteCount?: number,
	posterUrl: string,
	posterUrlPreview: string,
	ratingChange?: any,
	description?: string,
	premiereWorld?: string
}


export interface IKPFilmsResponseData {
	pagesCount: number,
	films: IKPFilm[] | IKPFilmMinimize[]
}

export interface IKPFilmMinimize {
	id: number,
	title: string,
	poster_small: string,
	viewed: boolean,
	to_watched: boolean,
	year: string,
	duration: string,
	rating: string
}

export interface IKPFilmFullData {
	id: number,
	title: string,
	overview: string,
	poster_small: string,
	poster_big: string,
	viewed: boolean,
	to_watched: boolean,
	release_date: string,
	genres: string[],
	runtime: string,
	trailer_path: string,
	facts: string[],
	rating: string
}

export interface IKPVideo {
	url: string,
	name: string,
	site: string,
	size: number,
	type: KP_VIDEO
}

export interface IKPVideos {
	trailers: IKPVideo[],
	teasers: IKPVideo[]
}