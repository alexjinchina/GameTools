import fs from "fs";
import path from "path";

export { fs, path };
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
