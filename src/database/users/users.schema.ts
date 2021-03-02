import { Schema } from "mongoose"
import { findUserById, createUser } from "db.users/users.statics"
import { setUsersViewedFilms, getUsersViewedFilms } from "db.users/users.methods"

const UserSchema = new Schema({
    user_id: String,
    login: String,
    password: String,
    viewed_ids: Array,
    to_watch_ids: Array,
    friends: Array
})

// @ts-ignore
UserSchema.statics.findUserById = findUserById
// @ts-ignore
UserSchema.statics.createUser = createUser

// @ts-ignore
UserSchema.methods.setUsersViewedFilms = setUsersViewedFilms
// @ts-ignore
UserSchema.methods.getUsersViewedFilms = getUsersViewedFilms

export default UserSchema