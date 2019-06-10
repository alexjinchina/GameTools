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

export function getDirs(bundleId) {
	return {
		SharedPreferencesDir: `/data/data/${bundleId}/shared_prefs`,
		ExternalFilesDir: `/sdcard/Android/data/${bundleId}/files`
	};
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
	const dirs = getDirs(bundleId);

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
