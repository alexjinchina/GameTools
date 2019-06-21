import { PermissionsAndroid, NativeModules } from "react-native";

import RNFS from "react-native-fs";
import RNPath from "react-native-path";

import appInfo from "../../app.json";

export { RNFS };
export const fs = {
	...RNFS,
	statASync: async (path, options) => RNFS.stat(path),
	readFileAsync: RNFS.readFile,
	writeFileAsync: RNFS.writeFile
	// }
};

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

export const GameToolsAppPaths = {
	MainBundlePath: fs.MainBundlePath,
	CachesDirectoryPath: fs.CachesDirectoryPath,
	ExternalCachesDirectoryPath: fs.ExternalCachesDirectoryPath,
	DocumentDirectoryPath: fs.DocumentDirectoryPath,
	ExternalDirectoryPath: fs.ExternalDirectoryPath,
	ExternalStorageDirectoryPath: fs.ExternalStorageDirectoryPath,
	TemporaryDirectoryPath: fs.TemporaryDirectoryPath,
	LibraryDirectoryPath: fs.LibraryDirectoryPath,
	PicturesDirectoryPath: fs.PicturesDirectoryPath,
	FileProtectionKeys: fs.FileProtectionKeys,
	externalDirectoryPath: fs.ExternalDirectoryPath
};

export const Permission = {
	READ_EXTERNAL_STORAGE: PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
	WRITE_EXTERNAL_STORAGE: PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
	async request(permission, params = {}) {
		const granted = await PermissionsAndroid.request(permission, {
			title: params.title || `${appInfo.displayName} Permission request`,
			message: params.message || `${appInfo.displayName} needs ${permission}.`,
			buttonNeutral: params.buttonNeutral || "Ask Me Later",
			buttonNegative: params.buttonNegative || "Cancel",
			buttonPositive: params.buttonPositive || "OK"
		});
		return granted;
	}
};

export const { SaveFileHelper, GameHelper } = NativeModules;

export const DEV_MODE = __DEV__;
