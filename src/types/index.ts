export type UserType = {
    id: string,
    login: string,
    password: string,
    viewed_ids: string[],
    to_watch_ids: string[]
}

export type AuthType = {
    login: string,
    password: string
}
