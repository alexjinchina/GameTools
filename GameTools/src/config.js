import {} from "./utils";

const config = {
  remote_url:
    "https://raw.githubusercontent.com/alexjinchina/game-tools/master/"
};

let gamesConfig;

export default config;

export async function loadGamesConfig() {
  if (!gamesConfig) {
    gamesConfig = require("../config/games-config");
  }

  return gamesConfig;
}
