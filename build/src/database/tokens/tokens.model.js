"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenModel = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("~/utils/constants");
const tokens_schema_1 = __importDefault(require("~/database/tokens/tokens.schema"));
exports.TokenModel = mongoose_1.model(constants_1.MODELS.token, tokens_schema_1.default);
