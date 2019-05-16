


export default class SqliteSaveFile {
    constructor(game, name, config, params = {}) {
        this.game = game
        this.name = name
        this.config = config
        this.params = params

    }
    get remoteDBPath() {
        return this.game.parseFilePath(this.config.file)
    }
    async load() {
        const remoteDBPath = this.remoteDBPath

    }
}