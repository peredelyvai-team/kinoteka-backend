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
    popular: '/films/popular',
    latest: '/films/latest',
    recommended: '/films/recommended',
	  selected: '/films/:id'
  }
}

export const MODELS = {
  user: 'user',
  token: 'token'
}

export const FIELDS = {
  viewed_ids: 'viewed_ids'
}