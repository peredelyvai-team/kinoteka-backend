"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const users_schema_1 = __importDefault(require("db.users/users.schema"));
const constants_1 = require("~/utils/constants");
exports.UserModel = mongoose_1.model(constants_1.MODELS.user, users_schema_1.default);
