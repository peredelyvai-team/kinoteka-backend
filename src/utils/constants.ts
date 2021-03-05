export const PATH = {
  register: '/register',
  login: '/login',
  logout: '/logout',
  user: '/api/user',
  auth: '/authorize',
  token: '/token',

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