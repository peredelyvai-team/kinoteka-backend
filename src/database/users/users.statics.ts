import {IUser, IUserDocument, IUserModel} from "db.users/users.types"

export async function findUserById (this: IUserModel, user_id: string): Promise<IUserDocument | null> {
    return this.findOne({user_id})
}

export async function createUser (this: IUserModel, user: IUser): Promise<IUserDocument> {
    return this.create(user)
}
