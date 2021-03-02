import { Request, Response } from "express"
import {MESSAGES} from "utils/messages";
const jwt = require('jsonwebtoken')
export function authenticationCheck (req: Request, res: Response, next: any) {
  const header = req.headers.authorization
  if (header) {
    const token = header.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err: any, user: any) => {
      if (err) {
        console.log(err)
        return res.sendStatus(403)
      } else {
        console.log(user)
        next()
      }
    })
  } else {
    return res.status(403).send(MESSAGES.BAD_AUTH_PARAMETERS)
  }
}