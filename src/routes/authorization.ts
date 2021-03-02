import express, { Request, Response } from "express"
import { PATH } from "~/utils/constants"
import {MESSAGES} from "utils/messages";
import {errorHandler} from "utils/helpers";
import {AuthType} from "~/types";
import {findUserByCondition} from "~/routes/user";
import {TokenModel} from "~/database/tokens/tokens.model";
const jwt = require('jsonwebtoken')
const authRouter = express.Router()

async function loginUser ({ login, password }: AuthType, res: Response) {
  const user = findUserByCondition({ login })

  if (user) {
    const accessToken = jwt.sign({ login }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20m' })
    const refreshToken = jwt.sign({ login }, process.env.REFRESH_TOKEN_SECRET)

    await TokenModel.create({ token: refreshToken })

    res.json({ accessToken, refreshToken })
  }
}

authRouter.post(PATH.login, async (req: Request, res: Response) => {
  try {
    const { login, password } = req.body

    if (login && password) {
      await loginUser({ login, password }, res)
    } else {
      res.status(403).send(MESSAGES.BAD_AUTH_PARAMETERS)
    }
  } catch (error) {
    errorHandler(error, res)
  }
})

authRouter.post(PATH.token, async (req: Request, res: Response) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(401)
    }

    const token_key = TokenModel.findOne({ token })
    if (!token_key) {
      return res.status(403)
    }

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err: any, { login }: any) => {
      if (err) {
        errorHandler(err, res, 403)
      }

      const accessToken = jwt.sign({ login }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20m' })
      const refreshToken = jwt.sign({ login }, process.env.REFRESH_TOKEN_SECRET)

      await TokenModel.findOneAndDelete({ token })

      res.json({ accessToken, refreshToken })
    })

  } catch (error) {
    errorHandler(error, res)
  }
})

export { authRouter }