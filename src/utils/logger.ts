import {ENV} from "utils/enums";

const log4js = require("log4js")

log4js.configure({
	appenders: {
		out: {
			type: "stdout"
		},
		app: {
			type: "file",
			filename: "log/main.log",
			layout: {
				type: "pattern",
				pattern: "[%d] [%f] [%p] [line %l]: %m"
			}
		}
	},
	categories: {
		default: {
			enableCallStack: true,
			appenders: [ "out", "app" ],
			level: "debug"
		}
	}
})

export const log = log4js.getLogger()