import cheerio from "react-native-cheerio";

import SaveFile from "./save-file";
import { fs } from "../../utils";

export default class XMLSaveFile extends SaveFile {
	constructor(game, name, config, params = {}) {
		super(game, name, config, params);
		this.dom = null;
	}

	async _load(params) {
		const filePath = await this._prepareLoadFile(params);
		this.dom = await cheerio.load(await fs.readFile(filePath));
		return;
	}

	async _save(params) {
		const filePath = await this._prepareSaveFile(params);
		await fs.writeFile(filePath, this.dom.html());
		await this._commitSaveFile(params);
	}

	getValueByPath(valuePath) {
		console.debug(valuePath);
		debugger;
	}
}
