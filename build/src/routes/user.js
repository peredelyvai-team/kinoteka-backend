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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const constants_1 = require("utils/constants");
const uuid_random_1 = __importDefault(require("uuid-random"));
const users_model_1 = require("db.users/users.model");
const userRouter = express_1.default.Router();
exports.userRouter = userRouter;
userRouter.post(constants_1.PATH.user, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { login, password } = req.body;
        const user = {
            user_id: uuid_random_1.default(),
            login,
            password,
            viewed_ids: [],
            to_watch_ids: [],
            friends: []
        };
        yield users_model_1.UserModel.create(user);
        console.log(`User created: ${user.login}`);
        return res.status(200).send(user);
    }
    catch (error) {
        console.log(error);
        return res.status(500);
    }
}));
