import fs from "react-native-fs";
import RNPath from "react-native-path";

import { displayName as APP_DISPLAY_NAME } from "../../app.json";

export { fs };

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

import { PermissionsAndroid } from "react-native";
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
