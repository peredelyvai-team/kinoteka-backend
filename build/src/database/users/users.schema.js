"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const users_statics_1 = require("db.users/users.statics");
const users_methods_1 = require("db.users/users.methods");
const UserSchema = new mongoose_1.Schema({
    id: String,
    login: String,
    password: String,
    viewed_ids: Array,
    to_watch_ids: Array
});
// @ts-ignore
UserSchema.statics.findUserById = users_statics_1.findUserById;
// @ts-ignore
UserSchema.statics.createUser = users_statics_1.createUser;
// @ts-ignore
UserSchema.methods.setUsersViewedFilms = users_methods_1.setUsersViewedFilms;
// @ts-ignore
UserSchema.methods.getUsersViewedFilms = users_methods_1.getUsersViewedFilms;
exports.default = UserSchema;
