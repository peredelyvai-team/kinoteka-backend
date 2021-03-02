import mongoose from "mongoose"

let database: mongoose.Connection

export const connect = () => {
    if (database) {
        return
    }
    const password = process.env.MONGO_DB_PASSWORD
    const login = process.env.MONGO_DB_LOGIN
    const mdb_name = process.env.MONGO_DB_NAME
    const uri: string = `mongodb+srv://${login}:${password}@kinoteka-cluster.ayank.mongodb.net/${mdb_name}?retryWrites=true&w=majority`
    console.log(uri)
    mongoose.connect(uri, {
        useFindAndModify: true,
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, () => {
        console.log('database connected')
    })

    database = mongoose.connection

    database.on("error", (error) => {
        console.log(error)
        console.log("Database error")
    })
}

export const disconnect = () => {
    if (!database) {
        return
    }
    mongoose.disconnect()
}