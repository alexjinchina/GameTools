/**
 *
 */
import SQLite from "react-native-sqlite-storage";
import { fs, path, lodash, Permission, castValueType } from "./utils";

SQLite.DEBUG(true);
SQLite.enablePromise(true);

const FIELDS = require("./config/merge_dragons/fields");
const KEYS = lodash.reduce(
  FIELDS,
  (keys, fields, file) => {
    return lodash.reduce(
      fields,
      (keys, info, field) => {
        const keyInfo = lodash.assign(
          lodash.isString(info) ? { key: info } : lodash.cloneDeep(info),
          { file, field }
        );
        const { key } = keyInfo;
        if (!key.endsWith("?")) {
          keys[key] = keyInfo;
        }
        return keys;
      },
      keys
    );
  },
  {}
);

const HOME_DATA_CONFIG = require("./config/merge_dragons/home");

const GAME_PACKAGE_NAME = "com.gramgames.mergedragons";
const GAME_DB_PATHS = [
  `/sdcard/Android/data/${GAME_PACKAGE_NAME}/files/md_db.db`
];
const DB_FILENAME = "md_db.db";
const LOCAL_DB_DIR = `/data/user/0/com.mergedragonstools/databases`;

const FILE_LEVEL_HOME = "Level_Home";
const AREA_NONE = "NONE";

export default class DB {
  constructor(params = {}) {
    this.db = null;
    this.storage = {};
    this.storageUpdatedFiles = new Set();
    this.messageCallback = params.messageCallback;
    this.errorCallback = params.errorCallback;
  }

  getKeys() {
    return lodash.keys(KEYS);
  }

  getKeyInfo(key) {
    return KEYS[key];
  }

  getValue(key) {
    const { file, field, type } = this.getKeyInfo(key);
    return castValueType(type, lodash.get(this.storage[file], field));
  }

  setValue(key, value) {
    const { file, field, type } = this.getKeyInfo(key);
    console.log(`setValue(${key},${value})`);
    lodash.set(this.storage[file], field, castValueType(type, value));
    this.storageUpdatedFiles.add(file);
  }

  getAreas() {
    return lodash.keys(HOME_DATA_CONFIG.areas);
  }

  getCashAreas() {
    return HOME_DATA_CONFIG.cash_areas;
  }

  getLevelHome() {
    return this.storage[FILE_LEVEL_HOME];
  }
  setLevelHomeModified() {
    this.storageUpdatedFiles.add(FILE_LEVEL_HOME);
  }
  getAreasLockStateData() {
    return this.getLevelHome()["1"]["1"]["0"];
  }
  getCellInfo() {
    return this.getLevelHome()["1"]["0"];
  }
  getLockedAreas() {
    const lockedAreas = new Set();
    lodash.forEach(this.getAreasLockStateData(), ys => {
      lodash.forEach(ys, area => {
        if (area !== AREA_NONE) {
          lockedAreas.add(area);
        }
      });
    });

    return lockedAreas;
  }

  unlockArea(area, reset) {
    const state = this.getAreasLockStateData();
    const cells = this.getCellInfo();
    HOME_DATA_CONFIG.areas[area].forEach(([x, y]) => {
      console.log(`unlocking ${area}(${x},${y})`);
      console.assert(state[x][y] === area || state[x][y] === AREA_NONE);
      state[x][y] = AREA_NONE;
      const n = `${x}_${y}`;
      if (reset || !cells[n]) {
        cells[n] = lodash.defaults(
          {
            "0": x,
            "1": y
          },
          HOME_DATA_CONFIG.unlockedLandPieces
        );
      }
    });
    this.setLevelHomeModified();
  }

  async open(params = {}) {
    params = this._buildParams(params);
    await this._pull(params);
    return await this._open(params);
  }

  async save(params = {}) {
    params = this._buildParams(params);

    for (const file of this.storageUpdatedFiles) {
      params.messageCallback(`updating storage file: ${file}...`);
      const data = this.storage[file];
      const json = await JSON.stringify(data);
      await this.db.executeSql(
        `UPDATE storage SET data=? WHERE file="${file}";`,
        [json]
      );
    }
    this.storageUpdatedFiles.clear();
    await this._close(params);
    await this._push(params);
    await this._open(params);
    // await this.db.commit();
    return this;
  }

  _buildParams(params = {}) {
    params.messageCallback =
      params.messageCallback ||
      this.messageCallback ||
      (msg => {
        console.debug(msg);
      });
    params.errorCallback = params.errorCallback || this.errorCallback;
    return params;
  }

  async _locateGameDB(params) {
    for (const p of GAME_DB_PATHS) {
      params.messageCallback(`checking game db ${p} ...`);
      const stats = await fs.stat(p);
      if (stats.size <= 0) {
        params.messageCallback(`game db file ${p} size=${stats.size}!`);
        continue;
      }
      return p;
    }
  }

  async _dbExecSQL(sql, args) {
    try {
      const [results] = await this.db.executeSql(sql, args);
      return results;
    } catch (error) {
      throw error[1];
    }
  }

  async _transactionExecSQL(tx, sql, args) {
    try {
      const [, results] = await tx.executeSql(sql, args);
      return results;
    } catch (error) {
      debugger;
      throw error[1];
    }
  }

  async _open(params) {
    try {
      await this._close(params);
      params.messageCallback(`opening db file ${DB_FILENAME}...`);
      this.db = await SQLite.openDatabase(DB_FILENAME);
      params.messageCallback(`db opened.`);

      params.messageCallback(`loading storage...`);
      // const tx = await db.transaction()
      // debugger
      // const results = await this._transactionExecSQL(tx, "SELECT * FROM storage")
      this.storage = {};
      this.storageUpdatedFiles.clear();
      const results = await this._dbExecSQL("SELECT * FROM storage");

      const len = results.rows.length;
      for (let i = 0; i < len; i++) {
        const row = results.rows.item(i);
        // console.log(`file: ${row.file}, len: ${row.data.length}`);
        this.storage[row.file] = JSON.parse(row.data);
      }
      params.messageCallback(`storage loaded.`);
    } catch (error) {
      if (params.errorCallback) params.errorCallback(error);
      else throw error;
    }
  }

  async _close(params) {
    try {
      if (this.db) {
        params.messageCallback("closing db...");
        await this.db.close();
        this.db = null;
      } else {
        const db = await SQLite.openDatabase(DB_FILENAME);
        await db.close();
      }
      this.storage = {};
    } catch (error) {
      debugger;
      if (params.errorCallback) params.errorCallback(error);
      else throw error;
    }
  }
  async _pull(params) {
    try {
      await this._close(params);
      const gameDBPath = await this._locateGameDB(params);
      //const localDB = pathAppend(fs.ExternalStorageDirectoryPath, DB_FILENAME)
      //const localDB = pathAppend(fs.DocumentDirectoryPath, DB_FILENAME)
      const localDBPath = path.append(LOCAL_DB_DIR, DB_FILENAME);

      params.messageCallback(`request permission...`);
      const granted = await Permission.request(
        Permission.READ_EXTERNAL_STORAGE
      );
      params.messageCallback(`permission ${granted}`);

      params.messageCallback(`copying db file to ${localDBPath}...`);
      await fs.copyFile(gameDBPath, localDBPath);

      params.messageCallback(`copy db ok.`);
    } catch (error) {
      if (params.errorCallback) params.errorCallback(error);
      else throw error;
    }
  }
  async _push(params) {
    try {
      await this._close(params);
      const gameDBPath = await this._locateGameDB(params);
      const localDBPath = path.append(LOCAL_DB_DIR, DB_FILENAME);

      params.messageCallback(`request permission...`);
      const granted = await Permission.request(
        Permission.WRITE_EXTERNAL_STORAGE
      );
      params.messageCallback(`permission ${granted}`);

      params.messageCallback(`copying db file to ${gameDBPath}...`);
      await fs.copyFile(localDBPath, gameDBPath);

      params.messageCallback(`copy db ok.`);
    } catch (error) {
      if (params.errorCallback) params.errorCallback(error);
      else throw error;
    }
  }
}
