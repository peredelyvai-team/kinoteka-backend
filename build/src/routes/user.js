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
exports.userRouter = exports.findUserByCondition = void 0;
const express_1 = __importDefault(require("express"));
const constants_1 = require("~/utils/constants");
const uuid_random_1 = __importDefault(require("uuid-random"));
const users_model_1 = require("db.users/users.model");
const messages_1 = require("utils/messages");
const jwtAuth_1 = require("~/middlewares/jwtAuth");
const userRouter = express_1.default.Router();
exports.userRouter = userRouter;
function findExistUser(login) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield users_model_1.UserModel.findOne({ login: login });
        console.log(users);
        return users !== null;
    });
}
function createUser(login, password, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = {
            user_id: uuid_random_1.default(),
            login,
            password,
            viewed_ids: [],
            to_watch_ids: [],
            friends: []
        };
        console.log(user);
        yield users_model_1.UserModel.create(user);
        console.log(`User created: ${user.login}`);
        return res.status(200).send(user);
    });
}
function findUserByCondition(condition) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield users_model_1.UserModel.findOne(condition);
        if (user) {
            return {
                login: user.login,
                user_id: user.user_id,
                viewed_ids: user.viewed_ids,
                to_watch_ids: user.to_watch_ids,
                friends: user.friends
            };
        }
        else {
            return null;
        }
    });
}
exports.findUserByCondition = findUserByCondition;
function validateUserAndSend(user, res) {
    if (user) {
        return res.status(200).send(user);
    }
    else {
        res.status(400).send(messages_1.MESSAGES.USER_NOT_FOUND);
    }
}
userRouter.post(constants_1.PATH.user, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { login, password } = req.body;
        if (login && password) {
            const userExists = yield findExistUser(login);
            if (userExists) {
                res.status(400).send(messages_1.MESSAGES.USER_EXISTS);
            }
            else {
                yield createUser(login, password, res);
            }
        }
        else {
            return res.status(403).send(messages_1.MESSAGES.BAD_AUTH_PARAMETERS);
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500);
    }
}));
userRouter.get(constants_1.PATH.user, jwtAuth_1.authenticationCheck, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const login = ((_a = req.query.login) === null || _a === void 0 ? void 0 : _a.toString()) || '';
        const user_id = ((_b = req.query.user_id) === null || _b === void 0 ? void 0 : _b.toString()) || '';
        console.log(process.env.NODE_ENV);
        console.log(`login: ${login}`);
        console.log(`user_id: ${user_id}`);
        if (login) {
            const user = yield findUserByCondition({ login });
            validateUserAndSend(user, res);
        }
        else {
            if (user_id) {
                const user = yield findUserByCondition({ user_id });
                validateUserAndSend(user, res);
            }
            else {
                return res.status(400).send(messages_1.MESSAGES.USER_INFO_NOT_PROVIDED);
            }
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500);
    }
}));
