import createGame from "../../src/game";
import { fs, lodash, path, resolveFilePath } from "../../src/utils";
export const describe = "fix ref data";
export const builder = {
	// "check-interval": { default: 1000 }
};

const REF_DATA_ROOT = path.join(process.cwd(), "ref-data");

export function handler(argv, gamesConfig) {
	// sync(argv, createGame(argv.game, gamesConfig[argv.game]));
	// console.log(`${argv.game}`);
	const { game: name } = argv;
	(name === "*" ? lodash.keys(gamesConfig) : [name]).map(async name => {
		// const fixer = FIXERS[name];
		await fix(name, gamesConfig[name]);
	});
}

async function fix(name, gameConfig) {
	const refDataDir = path.join(REF_DATA_ROOT, name);
	console.info(`refDataDir=${refDataDir}`);
	const game = createGame(name, gameConfig, {
		resolveFilePath: filePath =>
			resolveFilePath(({ suffix }) => path.join(refDataDir, suffix), filePath)
	});

	for (const name in game.saveFiles) {
		const file = game.saveFiles[name];
		if (!fs.existsSync(file.remoteFilePath)) {
			console.info(`skip not exists file ${name} at ${file.remoteFilePath}.`);
			return;
		}
		console.info(`loading ${name} at ${file.remoteFilePath}...`);
		await file.load();
		console.info(`fixing ${name} at ${file.remoteFilePath}...`);
		await file.fix();
		console.info(`saving ${name} at ${file.remoteFilePath}...`);
		await file.save();
	}
}
