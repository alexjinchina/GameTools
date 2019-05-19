import { NativeModules } from "react-native";

import { lodash, Permission, path, fs } from "../../utils";

const SaveFileHelper = NativeModules.SaveFileHelper;
SaveFileHelper.setLoggingLevel(__DEV__ ? "debug" : "info");
export default class SqliteSaveFile {
  constructor(game, name, config, params = {}) {
    this.game = game;
    this.name = name;
    this.config = config;
    this.params = lodash.defaults(params || {}, this.game.params);
  }

  toString() {
    return `<SqliteSaveFile: ${this.name}>`;
  }

  get remoteDBPath() {
    return this.game.parseFilePath(this.config.file);
  }
  get localDBPath() {
    return path.join(this.game.tempSaveFilePath, this.name);
  }
  async load(params) {
    params = lodash.defaults(params, this.params);
    params.info(`${this}: loading sqlite db ...`);
    const remoteDBPath = this.remoteDBPath;
    const localDBPath = this.localDBPath;
    params.info(`${this}: request permission...`);
    await Permission.request(Permission.READ_EXTERNAL_STORAGE);
    params.info(`${this}: making local dir...`);
    await fs.mkdir(path.dirname(localDBPath));
    params.info(`${this}: copying remote db...`);
    await fs.copyFile(remoteDBPath, localDBPath);
    params.info(`${this}: loading data...`);
    const data = await SaveFileHelper.loadSQLiteData(localDBPath, this.config);
    params.info(`${this}: parsing data...`);
    lodash.forEach(this.config.tables, (config, tableName) => {
      const tableData = data[tableName];
      if (lodash.isPlainObject(config.fields)) {
        const signleField = lodash.keys(config.fields).length === 1;
        lodash.forEach(config.fields, (fieldConifg, fieldName) => {
          if (fieldConifg == "json") {
            if (signleField) {
              lodash.keys(tableData).forEach(key => {
                tableData[key] = JSON.parse(tableData[key]);
              });
            } else {
              lodash.keys(tableData).forEach(key => {
                tableData[key][fieldName] = JSON.parse(tableData[key][fieldName]);
              });
            }
          }
        });
      }
    });
    debugger
  }
}
