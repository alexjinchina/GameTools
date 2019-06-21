import { fs, path } from "../../src/utils";

export default function getCommands(config) {
	// for (const filename of ) {
	// 	console.log(`${filename}`);
	// }

	return fs
		.readdirSync(__dirname)
		.map(filename => {
			// console.log(filename);
			const filepath = path.join(__dirname, filename);
			if (filepath === __filename) {
				// console.log(filename);
				// console.log(__filename);

				return null;
			}
			const {
				command = filename.replace(/\.js$/g, ""),
				describe,
				builder = {},
				handler
			} = require(filepath);
			return {
				command,
				describe: describe || command,
				builder,
				handler: argv => handler(argv, config)
			};
		})
		.filter(c => c != null);
}
