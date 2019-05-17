
import { NativeModules } from "react-native";

import { path, lodash, fs } from "../../utils"


export default class SqliteSaveFile {
    constructor(game, name, config, params = {}) {
        this.game = game
        this.name = name
        this.config = config
        this.params = params

    }

    toString() {
        return `<SqliteSaveFile: ${this.name}>`
    }
    get remoteDBPath() {
        return this.game.parseFilePath(this.config.file)
    }
    get tempDBPath() {
        return path.join(this.game.tempSaveFilePath, this.name)
    }
    async load(params) {
        params = lodash.defaults(params, this.params)
        params.info(`${this}: loading sqlite db ...`)
        const remoteDBPath = this.remoteDBPath
        const tempDBPath = this.tempDBPath;

        // params.info(`${this}: checking ${tempDBPath} ...`)
        // await fs.copyFile(remoteDBPath, tempDBPath);


        params.info(`${this}: copying db to temp ${tempDBPath} ...`)
        await fs.copyFile(remoteDBPath, tempDBPath);


    }
}