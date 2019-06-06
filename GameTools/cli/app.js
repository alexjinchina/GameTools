import yargs from "yargs";
import { lodash, GameToolsAppPaths } from "../src/utils";
import { loadGamesConfig } from "../src/config";

import getCommands from "./commands";
import adb from "./adb";

async function main(config) {
	getCommands(config).forEach(command => yargs.command(command));

	yargs
		.options({
			game: {
				alias: "g",
				choices: lodash.keys(config),
				default: lodash.keys(config)[0]
			}
		})

		.version()
		.help()
		.parse();
}

loadGamesConfig().then(main);
