import lodash from "lodash";

import {
	fs,
	path,
	GameToolsAppPaths,
	Permission,
	SaveFileHelper,
	GameHelper,
	DEV_MODE
} from "./common-modules";

export { lodash };
export const GameToolsAppInfo = {
	...require("../../app.json")
};

export {
	fs,
	path,
	GameToolsAppPaths,
	Permission,
	SaveFileHelper,
	GameHelper,
	DEV_MODE
};

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
