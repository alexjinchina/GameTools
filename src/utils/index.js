import lodash from "lodash";
import formatXml from "xml-formatter";
import {
	DEV_MODE,
	fs,
	GameHelper,
	GameToolsAppPaths,
	path,
	Permission,
	SaveFileHelper
} from "./common-modules";

export { lodash };
export {
	fs,
	path,
	GameToolsAppPaths,
	Permission,
	SaveFileHelper,
	GameHelper,
	formatXml,
	DEV_MODE
};
export const GameToolsAppInfo = {
	...require("../../app.json")
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

export const DATA_ROOT = "/sdcard/Android/data";
export const EXTERNAL_DATA_ROOT = "/sdcard/Android/data";
export const MAPPED_DIRS = {
	SharedPreferencesDir: {
		prefix: DATA_ROOT,
		suffix: "shared_prefs"
	},
	ExternalFilesDir: {
		prefix: EXTERNAL_DATA_ROOT,
		suffix: "files"
	}
};

export function getDirs(bundleId) {
	return lodash.reduce(
		MAPPED_DIRS,
		(out, info, key) => {
			out[key] = lodash.isString(bundleId)
				? path.join(info.prefix, bundleId, info.suffix)
				: bundleId(info);
			return out;
		},
		{}
	);
}

export function getGameToolsDirs() {
	return getDirs(GameToolsAppInfo.bundleId);
}

export function resolveFilePath(bundleId, filePath) {
	if (!lodash.isArray(filePath)) {
		const results = resolveFilePath(bundleId, [filePath]);
		if (lodash.isArray(results) && results.length === 1) return results[0];
		else return results;
	}
	const dirs = lodash.isPlainObject(bundleId) ? bundleId : getDirs(bundleId);

	return lodash.reduce(
		filePath,
		(results, filePath) => {
			// filePath.replace(/^\$\{(\w+)\}(\/.*)$/, function(_, p1, p2) {
			// 	console.log(p1, p2);
			// 	return "111" + p2;
			// });
			return lodash.reduce(
				dirs,
				(results, dirPath, dirName) => {
					const token = `$\{${dirName}}/`;
					if (filePath.startsWith(token)) {
						const remain = filePath.substring(token.length);
						if (lodash.isArray(dirPath)) {
							results.push(
								...lodash.map(dirPath, dirPath => path.join(dirPath, remain))
							);
						} else {
							results.push(path.join(dirPath, remain));
						}
					}
					return results;
				},
				results
			);
		},
		[]
	);
}
