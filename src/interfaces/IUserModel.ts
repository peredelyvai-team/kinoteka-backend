import * as mongoose from "mongoose";
import { UserType } from "~/types"

export interface IUserModel extends mongoose.Model<any>{
    build(attr: UserType): any
}