import { lodash } from "./utils";
import defaultConfig from "../config/games-config";

const config = {
  remote_url:
    "https://raw.githubusercontent.com/alexjinchina/game-tools/master/"
};

let gamesConfig;

export default config;

export async function loadGamesConfig() {
  if (!gamesConfig) {
    gamesConfig = defaultConfig;
  }

  lodash.forEach(gamesConfig, gameConfig => {
    lodash.forEach(gameConfig.values, (valueConfig, key) => {
      if (lodash.isString(valueConfig))
        gameConfig.values[key] = { valuePath: valueConfig };
    });
  });

  return gamesConfig;
}
