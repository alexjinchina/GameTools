export fs from "fs";
export path from "path";
export const Permission = {
	READ_EXTERNAL_STORAGE: "READ_EXTERNAL_STORAGE",
	WRITE_EXTERNAL_STORAGE: "WRITE_EXTERNAL_STORAGE",
	async request(permission, params = {}) {
		return true;
	}
};
