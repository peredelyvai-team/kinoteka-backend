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
exports.authRouter = void 0;
const express_1 = __importDefault(require("express"));
const constants_1 = require("~/utils/constants");
const messages_1 = require("utils/messages");
const helpers_1 = require("utils/helpers");
const user_1 = require("~/routes/user");
const tokens_model_1 = require("~/database/tokens/tokens.model");
const jwt = require('jsonwebtoken');
const authRouter = express_1.default.Router();
exports.authRouter = authRouter;
function loginUser({ login, password }, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = user_1.findUserByCondition({ login });
        if (user) {
            const accessToken = jwt.sign({ login }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20m' });
            const refreshToken = jwt.sign({ login }, process.env.REFRESH_TOKEN_SECRET);
            yield tokens_model_1.TokenModel.create({ token: refreshToken });
            res.json({ accessToken, refreshToken });
        }
    });
}
authRouter.post(constants_1.PATH.login, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { login, password } = req.body;
        if (login && password) {
            yield loginUser({ login, password }, res);
        }
        else {
            res.status(403).send(messages_1.MESSAGES.BAD_AUTH_PARAMETERS);
        }
    }
    catch (error) {
        helpers_1.errorHandler(error, res);
    }
}));
authRouter.post(constants_1.PATH.token, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(401);
        }
        const token_key = tokens_model_1.TokenModel.findOne({ token });
        if (!token_key) {
            return res.status(403);
        }
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, { login }) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                helpers_1.errorHandler(err, res, 403);
            }
            const accessToken = jwt.sign({ login }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20m' });
            const refreshToken = jwt.sign({ login }, process.env.REFRESH_TOKEN_SECRET);
            yield tokens_model_1.TokenModel.findOneAndDelete({ token });
            res.json({ accessToken, refreshToken });
        }));
    }
    catch (error) {
        helpers_1.errorHandler(error, res);
    }
}));
