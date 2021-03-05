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

export interface IFilm {
	adult: boolean,
	backdrop_path: string,
	genre_ids: number[],
	id: number,
	original_language: string,
	original_title: string,
	overview: string,
	popularity: number,
	poster_path: string,
	release_date: string,
	title: string,
	video: boolean,
	vote_average: number,
	vote_count: number
}

export interface ITMDBResponseData {
	page: string,
	results: Array<IFilm>,
	total_pages: number,
	total_results: number
}