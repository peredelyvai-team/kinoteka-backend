"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("./routes/user");
const authorization_1 = require("./routes/authorization");
const database_1 = require("~/database");
const logrocket_1 = __importDefault(require("logrocket"));
const fs = __importStar(require("fs"));
const cookieParser = require('cookie-parser');
require('dotenv').config();
const path = require("path");
const logger = require('morgan');
const appId = process.env.LOG_ROCKER_APP_ID;
logrocket_1.default.init(appId);
const app = express_1.default();
const PORT = process.env.PORT;
const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'));
app.use(logger('combined', { stream: logStream }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express_1.default.static(path.join(__dirname, 'public')));
app.use(user_1.userRouter);
app.use(authorization_1.authRouter);
app.get('/a', (req, res) => {
    res.cookie('sameSite', 'none');
    res.send('hello');
});
database_1.connect();
app.listen(PORT, () => {
    console.log('server running..');
});
module.exports = app;
