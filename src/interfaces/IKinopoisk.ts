export interface IKPFilm {
	filmId: number,
	nameRu: string,
	nameEn: string,
	year: string,
	filmLength: string,
	countries: { country: string }[],
	genres: { genre: string }[],
	rating: string,
	ratingVoteCount: number,
	posterUrl: string,
	posterUrlPreview: string,
	ratingChange: any
}


export interface IKPFilmsResponseData {
	pagesCount: number,
	films: IKPFilm[]
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