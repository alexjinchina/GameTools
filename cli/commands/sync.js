import adb from "../adb";
import { lodash, path } from "../../src/utils";

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
	// console.log(argv);
	// console.log(game);
	lodash.forEach(game.saveFiles, (file, name) => {
		console.log(`monitoring ${name}...`);
		const remoteFilePath = file.remoteFilePath.replace(/\\/g, "/");
		const localFilePath = file.localFilePath.replace(/\\/g, "/");
		console.debug(`remote file: ${remoteFilePath}`);
		console.debug(`local file: ${localFilePath}`);
		console.debug(adb.root());

		let { mtime: remoteMTime = null } = adb.stat(remoteFilePath) || {};
		let { mtime: localMTime = null } = adb.stat(localFilePath) || {};
		setInterval(() => {
			let { mtime: newRemoteMTime = null } = adb.stat(remoteFilePath) || {};
			if (
				newRemoteMTime !== null &&
				newRemoteMTime.valueOf() !== remoteMTime.valueOf()
			) {
				adb.shell(["mkdir", "-p", path.dirname(localFilePath)]);
				adb.shell(["cp", remoteFilePath, localFilePath]);
				remoteMTime = newRemoteMTime;
				localMTime = newRemoteMTime;
			}
			let { mtime: newLocalMTime } = adb.stat(localFilePath) || {};
			if (
				newLocalMTime !== null &&
				newLocalMTime.valueOf() !== localMTime.valueOf()
			) {
				adb.shell(["mkdir", "-p", path.dirname(remoteFilePath)]);
				adb.shell(["cp", localFilePath, remoteFilePath]);
				remoteMTime = newLocalMTime;
				localMTime = newLocalMTime;
			}
		}, argv.checkInterval);
	});
}
