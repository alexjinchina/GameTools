import { PermissionsAndroid } from "react-native";

import RNFS from "react-native-fs";
import lodash from "lodash";

import RNPath from "react-native-path";

import { name as APP_NAME, displayName as APP_DISPLAY_NAME } from "../app.json";
export { APP_NAME, APP_DISPLAY_NAME, lodash };

export const fs = RNFS;

export const path = {
	...RNPath,
	join(base, ...paths) {
		let out = base;
		paths.forEach(p => {
			if (!out.endsWith("/")) out += "/";

			out += p;
		});

		return out;
	}
};

export const Permission = {
	READ_EXTERNAL_STORAGE: PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
	WRITE_EXTERNAL_STORAGE: PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
	async request(permission, params = {}) {
		const granted = await PermissionsAndroid.request(permission, {
			title: params.title || `${APP_DISPLAY_NAME} Permission request`,
			message: params.message || `${APP_DISPLAY_NAME} needs ${permission}.`,
			buttonNeutral: params.buttonNeutral || "Ask Me Later",
			buttonNegative: params.buttonNegative || "Cancel",
			buttonPositive: params.buttonPositive || "OK"
		});
		return granted;
	}
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

const bundleId = "xyz.alexjinchina.gametools";

export function getPackageExternalDirectoryPath(packageName) {
	const p = fs.ExternalDirectoryPath;
	return p.replace(bundleId, packageName);
}
