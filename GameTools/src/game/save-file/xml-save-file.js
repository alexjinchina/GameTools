import cheerio from "cheerio";

import SaveFile from "./save-file";
import { fs } from "../../utils";

export default class SQLiteSaveFile extends SaveFile {
	constructor(game, name, config, params = {}) {
		super(game, name, config, params);
	}

	async _load(params) {}

	async _loadXml(params) {
		const remoteFilePath = this.remoteFilePath;
		return await fs.read(remoteFilePath);

		return await cheerio.load();
	}
}
