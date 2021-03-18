import mongoose from "mongoose"
import {ENV} from "utils/enums"
import {log} from "utils/logger";
import {MESSAGES} from "~/locale/messages";

let database: mongoose.Connection

interface DataBaseConnectionOptions {
	password?: string,
	login?: string,
	mdb_name?: string,
	clusterName?: string,
	clusterPrefix?: string
}

export const connect = () => {
    if (database) {
        return
    }
    
    let options: DataBaseConnectionOptions = {};
	
		log.info(MESSAGES.RUN_ON_ENV + process.env.NODE_ENV)
	
    
    if (process.env.NODE_ENV === ENV.test) {
    	options = {
		    password: process.env.MONGO_DB_PASSWORD_TEST,
		    login: process.env.MONGO_DB_LOGIN_TEST,
		    mdb_name: process.env.MONGO_DB_NAME_TEST,
		    clusterName: process.env.MONGO_CLUSTER_NAME_TEST,
		    clusterPrefix: process.env.MONGO_CLUSTER_PREFIX_TEST,
	    }
    } else {
	    options = {
		    password: process.env.MONGO_DB_PASSWORD,
		    login: process.env.MONGO_DB_LOGIN,
		    mdb_name: process.env.MONGO_DB_NAME,
		    clusterName: process.env.MONGO_CLUSTER_NAME,
		    clusterPrefix: process.env.MONGO_CLUSTER_PREFIX,
	    }
    }
	
		const uri: string = `mongodb+srv://${options.login}:${options.password}@${options.clusterName}.${options.clusterPrefix}.mongodb.net/${options.mdb_name}?retryWrites=true&w=majority`
  
    console.log(uri)
    mongoose.connect(uri, {
        useFindAndModify: true,
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, () => {
        log.debug('database connected')
    })

    database = mongoose.connection

    database.on("error", (error) => {
        console.log(error)
        console.log("Database error")
	      setTimeout(() => {
	      	connect()
	      }, 5000)
    })
}

export const disconnect = () => {
    if (!database) {
        return
    }
    mongoose.disconnect()
}
