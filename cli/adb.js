import child_process from "child_process";

import { lodash } from "../src/utils";

export const ADB_OPTIONS = {
	adb: {
		type: "string",
		default: "adb"
	},
	"adb-device": { type: "string" },
	"adb-usb": { type: "boolean", default: false },
	"adb-tcp": { type: "boolean", default: false },
	"adb-encoding": { type: "string", default: "utf8" }
};

export function initYargs(yargs) {
	if (!yargs) yargs = require(yargs);
	yargs.options(ADB_OPTIONS);
	yargs.middleware(argv => {
		adb.init(argv);
	});
}

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

		console.debug(this._exec("--version"));
	}

	_exec(args, onError = "throw") {
		const cmdArgs = [];
		if (this.device) cmdArgs.push("-s", this.device);
		if (this.usb) cmdArgs.push("-d");
		if (this.tcp) cmdArgs.push("-e");

		if (lodash.isString(args)) args = [args];
		cmdArgs.push(...(args || []));

		console.debug("adb exec: " + [this.adb, ...cmdArgs].join(" "));

		try {
			const output = child_process.execFileSync(this.adb, cmdArgs, {
				encoding: this.encoding
			});
			return output;
		} catch (error) {
			if (onError === "throw") throw error;
			debugger;
			console.error(error);
			throw error;
		}
	}

	stat(filePath, onNotFound = "null", onError = "throw") {
		try {
			const out = this.shell(["ls", "-l", filePath]).trim();

			("-rw-rw---- 1 u0_a86 u0_a86 54843 2019-05-30 19:12 /data/data/com.Seriously.BestFiends/shared_prefs/com.Seriously.BestFiends.v2.playerprefs.xml");
			const m = out.match(
				/^[-rw]+ \d+ [\w\d_]+ [\w\d_]+ \d+ (\d+-\d+-\d+ \d+:\d+) .*$/
			);
			if (!m) throw new Error(`invalid result!\n${out}`);
			return {
				mtime: new Date(m[1])
			};
		} catch (error) {
			const stderr = error.stderr.trim();
			if (stderr.search(/No such file or directory\s*$/) >= 0) {
				switch (onNotFound) {
					case "null":
						return null;
					case "throw":
						throw error;
				}
				if (lodash.isFunction(onNotFound)) {
					return onNotFound(error, filePath);
				}
			}
			switch (onError) {
				case "null":
					return null;
				case "throw":
					throw error;
			}
			if (lodash.isFunction(onError)) {
				return onError(error, filePath);
			}
			console.error(error);
			throw error;
		}
	}

	shell(args) {
		if (!args) throw new Error(`invalid args!`);
		if (!lodash.isArray(args)) args = [args];
		let out;
		try {
			// const shellCommand = args
			// 	.map(arg => (arg.search(/\s/) >= 0 ? `'${arg}'` : arg))
			// 	.join(" ");
			// out = this._exec(["shell", `"${shellCommand};echo $?"`]);
			out = this._exec(["shell", ...args]);
		} catch (error) {
			if (error.status !== 3221226356 || error.stderr) {
				throw error;
			}
			out = error.stdout;
		}

		// out = out.split();
		// const exitCode = out.pop();
		// if (exitCode !== "0")
		// 	throw new Error(`run adb shell cmd failed(${exitCode})!`);
		return out;
	}
	root() {
		return this._exec(["root"]);
	}
}

export const adb = new ADB();
export default adb;
