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

	lodash.forEach(gamesConfig, ({ defaultValueConfig = {}, values, locks }) => {
		lodash.forEach([values, locks], configs =>
			lodash.forEach(configs, (config, key) => {
				configs[key] = {
					...defaultValueConfig,
					...(lodash.isString(config) ? { valuePath: config } : {})
				};
			})
		);
	});

	return gamesConfig;
}
