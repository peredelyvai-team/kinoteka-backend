"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticationCheck = void 0;
const messages_1 = require("utils/messages");
const jwt = require('jsonwebtoken');
function authenticationCheck(req, res, next) {
    const header = req.headers.authorization;
    if (header) {
        const token = header.split(' ')[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                console.log(err);
                return res.sendStatus(403);
            }
            else {
                console.log(user);
                next();
            }
        });
    }
    else {
        return res.status(403).send(messages_1.MESSAGES.BAD_AUTH_PARAMETERS);
    }
}
exports.authenticationCheck = authenticationCheck;
