import { Document, Model } from "mongoose";

export interface IToken {
  token: string
}

export interface ITokenDocument extends IToken, Document {}

export interface ITokenModel extends Model<ITokenDocument> {}