import { NativeModules } from "react-native";

import { lodash, Permission, path, fs } from "../../utils";

const SaveFileHelper = NativeModules.SaveFileHelper;
SaveFileHelper.setLoggingLevel(__DEV__ ? "debug" : "info");

function saveFieldToDB(obj, key, fieldType) {
  switch (fieldType) {
    case "json":
      obj[key] = JSON.stringify(obj[key]);
      break;
  }
}
function loadFieldFromDB(obj, key, fieldType) {
  switch (fieldType) {
    case "json":
      obj[key] = JSON.parse(obj[key]);
      break;
  }
}

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
    try {
      params = lodash.defaults(params, this.params);
      const data = await this._loadData(params);
      params.info(`${this}: parsing data...`);
      lodash.forEach(this.config.tables, (config, tableName) => {
        const tableData = data[tableName];
        if (lodash.isPlainObject(config.fields)) {
          const fields = lodash.toPairs(config.fields);
          // const signleField = lodash.keys(config.fields).length === 1;
          lodash.keys(tableData).forEach(key => {
            if (fields.length === 1) {
              const [, fieldType] = fields[0];
              loadFieldFromDB(tableData, key, fieldType);
            } else {
              fields.forEach((fieldName, fieldType) => {
                loadFieldFromDB(tableData[key], fieldName, fieldType);
              });
            }
          });
        }
      });
      this.data = data;
    } catch (error) {
      params.error(error)
    }
  }

  async _loadData(params) {
    params.info(`${this}: loading sqlite db ...`);
    const remoteDBPath = this.remoteDBPath;
    const localDBPath = this.localDBPath;
    params.info(`${this}: request permission...`);
    await Permission.request(Permission.READ_EXTERNAL_STORAGE);
    try {
      return await SaveFileHelper.loadSQLiteData(remoteDBPath, this.config);
    } catch (error) {
      switch (error.code) {
        case "SQLiteCantOpenDatabaseException":
          console.debug(error.message);
          break;
        default:
          throw error
      }
    }
    params.info(`${this}: making local dir...`);
    await fs.mkdir(path.dirname(localDBPath));
    params.info(`${this}: copying remote db...`);
    await fs.copyFile(remoteDBPath, localDBPath);
    params.info(`${this}: loading data...`);
    return await SaveFileHelper.loadSQLiteData(localDBPath, this.config);
  }

  getValueByPath(valuePath) {
    const parts = lodash.isString(valuePath) ? valuePath.split(".") : valuePath
    const tableName = parts.shift()
    const table = this.data[tableName]
    return lodash.get(table, parts.join("."))

  }
}
