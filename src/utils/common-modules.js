import _fs from "fs";
import path from "path";
import lodash from "lodash";

export { _fs, path };

export const fs = {
	..._fs,
	statASync: _fs.promises.stat,
	readFileAsync: async (path, length, position, encodingOrOptions = "utf8") => {
		const fd = _fs.openSync(path, "r");
		const stat = _fs.fstatSync(fd);
		if (!length) length = stat.size;
		if (!position) position = 0;

		const buf = Buffer.alloc(length);
		const readBytes = fs.readSync(fd, buf, 0, length, position);
		const { encoding } = lodash.isPlainObject(encodingOrOptions)
			? encodingOrOptions
			: { encoding: encodingOrOptions };

		if (!encoding || encoding === "raw") {
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + readBytes);
		} else if (encoding === "json") {
			return buf.toJSON();
		} else {
			return buf.toString(encoding, 0, readBytes);
		}
	},
	writeFileAsync: _fs.promises.writeFile
};

export const GameToolsAppPaths = {};

export const Permission = {
	READ_EXTERNAL_STORAGE: "READ_EXTERNAL_STORAGE",
	WRITE_EXTERNAL_STORAGE: "WRITE_EXTERNAL_STORAGE",
	async request(permission, params = {}) {
		return true;
	}
};

export const GameHelper = {};

export const SaveFileHelper = {
	setLoggingLevel(level) {
		this.loggingLevel = level;
	}
};

export const DEV_MODE = process.env.NODE_ENV !== "production";
