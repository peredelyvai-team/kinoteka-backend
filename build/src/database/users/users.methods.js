"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersViewedFilms = exports.setUsersViewedFilms = void 0;
const constants_1 = require("~/utils/constants");
function setUsersViewedFilms(viewed_ids) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            this.viewed_ids = viewed_ids;
            return this.save();
        }
        catch (error) {
            console.log(error);
            return null;
        }
    });
}
exports.setUsersViewedFilms = setUsersViewedFilms;
function getUsersViewedFilms(user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = this.model(constants_1.MODELS.user).findOne({ user_id });
            if (user) {
                return user.get(constants_1.FIELDS.viewed_ids);
            }
            else {
                return null;
            }
        }
        catch (error) {
            console.log(error);
            return null;
        }
    });
}
exports.getUsersViewedFilms = getUsersViewedFilms;
