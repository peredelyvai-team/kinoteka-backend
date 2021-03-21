import express, { Request, Response } from 'express'
import { connect } from "~/database"
import * as fs from "fs"
require('dotenv').config()

import { userRouter } from "./routes/user"
import { authRouter } from './routes/authorization'
import { filmsRouter } from './routes/films'
import {ENV} from "utils/enums"
import {log} from "utils/logger";

const cookieParser = require('cookie-parser')
const path = require("path")
const logger = require('morgan')
const app = express()

process.env.NODE_ENV = process.env.NODE_ENV || ENV.test
// process.env.DEBUG = "*"


const debug = require("debug")("logger");
debug("start application")

const setAppModules = function () {
	const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'))
	app.use(logger('dev', { stream: logStream }))
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use(cookieParser());
	app.use(express.static(path.join(__dirname, 'public')));
}

const declareAppRouters = function () {
	app.use(userRouter)
	app.use(authRouter)
	app.use(filmsRouter)
	
	app.get('/a', (req: Request, res: Response) => {
		res.cookie('sameSite', 'none')
		res.send('hello');
	});
}

const startApp = function () {
	const PORT = process.env.PORT
	connect()
	app.listen(PORT, () => {
		console.log('server running on PORT: ' + PORT)
		log.debug("Start application")
	})
}

setAppModules();
declareAppRouters();
startApp();

module.exports = app