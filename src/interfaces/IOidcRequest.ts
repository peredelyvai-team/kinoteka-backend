import { Request } from "express"

export interface IOidcRequest extends Request {
	oidc: any
}