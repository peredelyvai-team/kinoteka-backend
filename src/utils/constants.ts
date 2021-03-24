export const PATH = {
  register: '/register',
  login: '/login',
  logout: '/logout',
  auth: '/authorize',
  token: '/token',
	
	users: {
		films: {
			viewed: '/users/:id/films/viewed',
			to_watch: '/users/:id/films/to_watch'
		}
	},
	
  films: {
  	get: '/films',
    popular: '/films/popular',
    latest: '/films/latest',
    recommended: '/films/recommended',
	  selected: '/films/:id',
	  search: '/films/search',
	  searchByFilters: '/films/search-by-filters',
	  filters: '/films/filters'
  }
}

export const MODELS = {
  user: 'user',
  token: 'token'
}

export const FIELDS = {
  viewed_ids: 'viewed_ids'
}