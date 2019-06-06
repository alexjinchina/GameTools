import child_process from "child_process";

import yargs from "yargs";

import { lodash } from "../src/utils";

export const ADB_OPTIONS = {
	adb: {
		type: "string",
		default: "adb"
	},
	"adb-device": { type: "string" },
	"adb-usb": { type: "boolean", default: false },
	"adb-tcp": { type: "boolean", default: false },
	"adb-encoding": { type: "boolean", default: "utf8" }
};
yargs.options(ADB_OPTIONS);
yargs.middleware(argv => adb.init(argv));

function argKeyToMemberName(key) {
	return key.replace("adb-", "");
}

export class ADB {
	constructor() {
		this.reset();
	}

	reset() {
		lodash.forEach(ADB_OPTIONS, (option, key) => {
			key = argKeyToMemberName(key);
			this[key] = option.default;
		});
	}

	init(argv) {
		this.reset();
		if (argv) {
			lodash.forEach(ADB_OPTIONS, (option, key) => {
				if (lodash.has(argv, key)) {
					this[argKeyToMemberName(key)] = argv[key];
				}
			});
		}

		console.log(this._run("--version"));
	}

	_run(args) {
		const cmdArgs = [];
		if (this.device) cmdArgs.push("-s", this.device);
		if (this.usb) cmdArgs.push("-d");
		if (this.tcp) cmdArgs.push("-e");

		if (lodash.isString(args)) args = [args];
		cmdArgs.push(...(args || []));

		const output = child_process.execFileSync(this.adb, cmdArgs, {
			encoding: this.encoding
		});
		return output;
	}
}

export const adb = new ADB();
export default adb;
