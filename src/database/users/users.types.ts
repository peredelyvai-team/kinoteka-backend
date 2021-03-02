import { Document, Model } from "mongoose"

export interface IUser {
    user_id: string
    login: string
    password?: string
    viewed_ids?: string[]
    to_watch_ids?: string[]
    friends?: string[]
}

export interface IUserDocument extends IUser, Document {
    setUsersViewedFilms: (this: IUserDocument) => Promise<any>
    getUsersViewedFilms: (this: IUserDocument) => Promise<any>
}

export interface IUserCondition {
    user_id?: string,
    login?: string
}

export interface IUserModel extends Model<IUserDocument> {
    findUserById: (this: IUserModel, user_id: string) => Promise<IUserDocument>
    createUser: (this: IUserModel, user: IUser) => Promise<any>
}