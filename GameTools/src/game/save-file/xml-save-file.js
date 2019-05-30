import cheerio from "react-native-cheerio";

import SaveFile from "./save-file";
import { fs } from "../../utils";

export default class SQLiteSaveFile extends SaveFile {
	constructor(game, name, config, params = {}) {
		super(game, name, config, params);
		this.dom = null;
	}

	async _load(params) {
		this.dom = await this._tryLoad(
			async filePath => await cheerio.load(await fs.readFile(filePath)),
			null,
			params
		);

		return;
	}

	async _save(params) {
		await this._trySave(
			async filePath => await fs.writeFile(filePath, this.dom.html()),
			params
		);
	}

	getValueByPath(valuePath) {
		console.debug(valuePath);
		debugger;
	}
}
