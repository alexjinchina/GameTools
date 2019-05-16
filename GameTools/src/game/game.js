import { fs, path, lodash, Permission, castValueType } from "../utils";

export default class Game {
    constructor(name, config, params = {}) {
        this.name = name
        this.config = config

        this.params = lodash.defaults(params || {}, {
            info(msg) {
                console.info(msg);
                if (this.infoCallback) this.infoCallback(msg)
            },
            error(error) {
                console.error(error.message || error.toString());
                if (this.errorCallback) this.infoCallback(error)

            }

        });

    }

    toString() {
        return `<Game: ${this.name}>`
    }

    async load(params = {}) {
        params = lodash.defaults(params || {}, this.params)

        params.info(`loading ${this.name}...`)
    }
}