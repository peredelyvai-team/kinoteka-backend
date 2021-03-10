import * as mongoose from "mongoose";
import { UserType } from "~/types"

export interface IUserModel extends mongoose.Model<any>{
    build(attr: UserType): any
}

export interface IUserFilmsChanges {
	added: number[],
	removed: number[]
}