import yargs from "yargs";
import { lodash } from "../src/utils";
import { loadGamesConfig } from "../src/config";

import getCommands from "./commands";
import adb, { ADB_OPTIONS } from "./adb";

async function main(config) {
	getCommands(config).forEach(command => yargs.command(command));

	yargs.options(ADB_OPTIONS);
	yargs.middleware(argv => {
		adb.init(argv);
		if (!adb.device) {
		}
	});

	yargs
		.command("$0", "show help", () => {}, () => yargs.showHelp("log"))
		.options({
			game: {
				alias: "g",
				choices: ["*", ...lodash.keys(config)],
				default: "*"
			}
		})

		.version()
		.help()
		.parse();
}

loadGamesConfig().then(main);
