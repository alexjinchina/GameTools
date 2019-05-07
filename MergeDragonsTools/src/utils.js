import { Platform, PermissionsAndroid } from "react-native";

import RNFS from "react-native-fs";
import lodash from "lodash";

import { name as APP_NAME, displayName as APP_DISPLAY_NAME } from "../app.json";
export { APP_NAME, APP_DISPLAY_NAME, lodash };

export const fs = RNFS;

export const path = {
  append(base, ...comps) {
    comps.forEach(comp => {
      if (base[base.length - 1] !== "/") {
        base += "/";
      }
      base += comp;
    });

    return base;
  }
};

export const Permission = {
  READ_EXTERNAL_STORAGE: PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,

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

export function castValueType(type, value) {
  switch (type) {
    case "int":
      return parseInt(value);
    default:
      return value;
  }
}
