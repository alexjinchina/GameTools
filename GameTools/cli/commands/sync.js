import adb from "../adb";

import createGame from "../../src/game";

export const command = ["sync", "sync-save-files"];
export const describe = "sync game save files to local dir";
export const builder = {
	"check-interval": { default: 1000 }
};
export function handler(argv, gamesConfig) {
	sync(argv, createGame(argv.game, gamesConfig[argv.game]));
}

function sync(argv, game) {
	console.log(argv);
	console.log(game);
}
