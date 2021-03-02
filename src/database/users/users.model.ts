import { model } from 'mongoose'
import { IUserDocument } from "db.users/users.types"
import UserSchema from "db.users/users.schema";
import { MODELS } from "~/utils/constants";

export const UserModel = model<IUserDocument>(MODELS.user, UserSchema)