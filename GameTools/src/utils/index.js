import lodash from "lodash";
import {
	name as APP_NAME,
	displayName as APP_DISPLAY_NAME
} from "../../app.json";

import { fs, path, Permission } from "./common-modules";

export function isCLI() {
	return process.env.GAME_TOOLS_CLI === 1;
}
export const IS_CLI = isCLI();

export { lodash };
export { APP_NAME, APP_DISPLAY_NAME };
export { fs, path, Permission };

export const BUNDLE_ID = "xyz.alexjinchina.gametools";

export function castValueType(value, type, refValue) {
	if (!type) {
		switch (typeof refValue) {
			case "number":
				type = lodash.isInteger(refValue) ? "int" : "number";
				break;
			default:
				break;
		}
	}
	switch (type) {
		case "int":
			return parseInt(value);
		default:
			return value;
	}
}

export function getPackageExternalDirectoryPath(packageName) {
	const p = fs.ExternalDirectoryPath;
	return p.replace(BUNDLE_ID, packageName);
}
