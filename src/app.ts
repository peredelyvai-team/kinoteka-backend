import express, { Request, Response } from 'express'
import { userRouter } from "./routes/user"
import { authRouter } from './routes/authorization'
import { PATH } from "~/utils/constants"
import { connect } from "~/database"
import LogRocket from 'logrocket'
import * as fs from "fs"

const cookieParser = require('cookie-parser')
require('dotenv').config()
const path = require("path")
const logger = require('morgan')
const appId: any = process.env.LOG_ROCKER_APP_ID
LogRocket.init(appId)

const app = express()
const PORT = process.env.PORT

const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'))
app.use(logger('combined', { stream: logStream }))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(userRouter)
app.use(authRouter)

app.get('/a', (req: Request, res: Response) => {
	res.cookie('sameSite', 'none')
	res.send('hello');
});

connect()
app.listen(PORT, () => {
    console.log('server running..')
})

module.exports = app