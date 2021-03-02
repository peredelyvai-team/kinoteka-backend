"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
function errorHandler(error, res, code = 500) {
    console.log(error);
    res.status(500).send(error);
}
exports.errorHandler = errorHandler;
