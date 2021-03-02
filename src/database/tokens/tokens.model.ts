import { model } from 'mongoose'
import { ITokenDocument } from "~/database/tokens/tokens.types"
import { MODELS } from "~/utils/constants";
import TokenSchema from "~/database/tokens/tokens.schema";

export const TokenModel = model<ITokenDocument>(MODELS.token, TokenSchema)