import { } from "../../utils"

function detectType(filename) {
    if (!filename) return undefined
    filename = filename.toLower()
    if (filename.endsWith(".db")) return "sqlite"
    if (filename.endsWith(".xml")) return "xml"
    return

}


export function createSaveFile(game, name, config, params = {}) {
    const { type, file } = config
    return new require(`./${type || detectType(file)}`).default(
        game, name, config, params || {})
        

}