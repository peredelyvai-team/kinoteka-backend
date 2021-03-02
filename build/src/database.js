"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnect = exports.connect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
let database;
const connect = () => {
    if (database) {
        return;
    }
    const password = process.env.MONGO_DB_PASSWORD;
    const login = process.env.MONGO_DB_LOGIN;
    const mdb_name = process.env.MONGO_DB_NAME;
    const uri = `mongodb+srv://${login}:${password}@kinoteka-cluster.ayank.mongodb.net/${mdb_name}?retryWrites=true&w=majority`;
    mongoose_1.default.connect(uri, {
        useFindAndModify: true,
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, () => {
        console.log('database connected');
    });
    database = mongoose_1.default.connection;
    database.on("error", () => {
        console.log("Database error");
    });
};
exports.connect = connect;
const disconnect = () => {
    if (!database) {
        return;
    }
    mongoose_1.default.disconnect();
};
exports.disconnect = disconnect;
