/**
 * 
 */
import SQLite from 'react-native-sqlite-storage'
import { fs, path, lodash, Permission } from "./utils"


SQLite.DEBUG(true);
SQLite.enablePromise(true);

const FIELDS = require("./fields")
const KEYS = lodash.reduce(FIELDS, (keys, fields, file) => {
    return lodash.reduce(fields, (keys, info, field) => {
        const keyInfo = lodash.assign(
            lodash.isString(info) ? { key: info } : lodash.cloneDeep(info),
            { file, field })
        const { key } = keyInfo;
        if (!key.endsWith("?")) {
            keys[key] = keyInfo
        }
        return keys
    }, keys)
}, {})



const GAME_PACKAGE_NAME = 'com.gramgames.mergedragons'
const GAME_DB_PATHS = [`/sdcard/Android/data/${GAME_PACKAGE_NAME}/files/md_db.db`]
const DB_FILENAME = "md_db.db"
const LOCAL_DB_DIR = `/data/user/0/com.mergedragonstools/databases`


export default class DB {
    constructor(params = {}) {

        this.db = null
        this.storage = {}
        this.messageCallback = params.messageCallback
        this.errorCallback = params.errorCallback
    }

    getKeys() {
        return lodash.keys(KEYS)
    }

    getKeyInfo(key) {
        return KEYS[key]
    }

    getValue(key) {
        const { file, field, type } = this.getKeyInfo(key)
        const v = lodash.get(this.storage[file], field)
        switch (type) {
            case "int": return parseInt(v)
            default: return v

        }
    }

    async open(params = {}) {
        return await this._open(this._buildParams(params));
    }

    _buildParams(params = {}) {
        params.messageCallback = params.messageCallback || this.messageCallback || (msg => { console.debug(msg) });
        params.errorCallback = params.errorCallback || this.errorCallback;
        return params
    }

    async _locateGameDB(params) {

        for (const p of GAME_DB_PATHS) {
            params.messageCallback(`checking game db ${p} ...`)
            const stats = await fs.stat(p)
            if (stats.size <= 0) {
                params.messageCallback(`game db file ${p} size=${stats.size}!`)
                continue
            }
            return p
        }
    }

    async _dbExecSQL(sql, args) {
        try {
            const [results,] = await this.db.executeSql(sql, args)
            return results;
        } catch (error) {
            throw error[1]
        }
    }

    async _transactionExecSQL(tx, sql, args) {
        try {
            const [, results] = await tx.executeSql(sql, args)
            return results;
        } catch (error) {
            debugger
            throw error[1]
        }
    }

    async _open(params) {
        try {
            await this._close(params)
            const gameDBPath = await this._locateGameDB(params)
            //const localDB = pathAppend(fs.ExternalStorageDirectoryPath, DB_FILENAME)
            //const localDB = pathAppend(fs.DocumentDirectoryPath, DB_FILENAME)
            const localDBPath = path.append(LOCAL_DB_DIR, DB_FILENAME)

            params.messageCallback(`request permission...`)
            const granted = await Permission.request(Permission.READ_EXTERNAL_STORAGE);
            params.messageCallback(`permission ${granted}`)

            params.messageCallback(`copying db file to ${localDBPath}...`)
            await fs.copyFile(gameDBPath, localDBPath)

            params.messageCallback(`opening db file ${DB_FILENAME}...`)
            this.db = await SQLite.openDatabase(DB_FILENAME)
            params.messageCallback(`db opened.`)


            params.messageCallback(`loading storage...`)
            // const tx = await db.transaction()
            // debugger
            // const results = await this._transactionExecSQL(tx, "SELECT * FROM storage")
            this.storage = {}
            const results = await this._dbExecSQL("SELECT * FROM storage")

            const len = results.rows.length;
            for (let i = 0; i < len; i++) {
                const row = results.rows.item(i);
                // console.log(`file: ${row.file}, len: ${row.data.length}`);
                this.storage[row.file] = JSON.parse(row.data)
            }
            params.messageCallback(`storage loaded.`)


        } catch (error) {
            if (params.errorCallback) params.errorCallback(error)
            else throw error
        }

    }

    async _close(params) {
        try {
            if (this.db) {
                params.onMessage("closing db...")
                this.db.close()
                this.db = null
            } else {
                const db = await SQLite.openDatabase(DB_FILENAME)
                await db.close()
            }
            this.storage = {}
        } catch (error) {
            debugger
            if (params.errorCallback) params.errorCallback(error)
            else throw error
        }


    }
}