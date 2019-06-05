import yargs from "yargs";
process.env.GAME_TOOLS_CLI = true;
import { lodash } from "../src/utils";
import { loadGamesConfig } from "../src/config";

async function main(config) {
	yargs
		.options({
			game: {
				alias: "g",
				choices: lodash.keys(config),
				default: lodash.keys(config)[0]
			}
		})
		// .command("$0", "", () => {}, argv => {})
		.command(
			"copy",
			"copy files to local dir",
			yargs =>
				yargs
					.options({
						a: { default: "123" }
					})
					.help(),
			argv => {
				console.log(argv);
			}
		)
		.version()
		.help()
		.parse();
}

loadGamesConfig().then(main);
