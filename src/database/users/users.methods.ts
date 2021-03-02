import {IUserDocument} from "db.users/users.types"
import {FIELDS, MODELS} from "~/utils/constants";

export async function setUsersViewedFilms (this: IUserDocument, viewed_ids: string[]): Promise<IUserDocument | null> {
    try {
        this.viewed_ids = viewed_ids
        return this.save()
    } catch (error) {
        console.log(error)
        return null
    }
}

export async function getUsersViewedFilms (this: IUserDocument, user_id: string): Promise<string[] | null> {
    try {
        const user = this.model(MODELS.user).findOne({ user_id })
        if (user) {
            return user.get(FIELDS.viewed_ids)
        } else {
            return null
        }
    } catch (error) {
        console.log(error)
        return null
    }
}