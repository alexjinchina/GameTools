import { fs } from "./utils"

const config = {
    remote_url: "https://raw.githubusercontent.com/alexjinchina/game-tools/master/"


}

export default config

export async function loadGamesConfig() {
    const gamesConfig = require("../config/games-config")
    return gamesConfig

}

