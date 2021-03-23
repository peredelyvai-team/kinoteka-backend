import { Document, Model } from "mongoose"

export interface IUser {
  user_id: string
  login: string
  password?: string
  viewed_ids: number[]
  to_watch_ids: number[]
  friends?: string[]
}

export interface IUserFilms {
	viewedFilms: number[],
	toWatchIds: number[]
}

export interface IUserDocument extends IUser, Document {
    setUsersViewedFilms: (this: IUserDocument) => Promise<any>
    getUsersViewedFilms: (this: IUserDocument) => Promise<any>
}

export interface IUserCondition {
    user_id?: string,
    login?: string,
    password?: string
}

export interface IUserModel extends Model<IUserDocument> {
    findUserById: (this: IUserModel, user_id: string) => Promise<IUserDocument>
    createUser: (this: IUserModel, user: IUser) => Promise<any>
}