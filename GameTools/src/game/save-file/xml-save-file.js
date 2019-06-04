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
		this.dom = await cheerio.load(await fs.readFile(filePath), {
			xml: {
				normalizeWhitespace: true
			}
		});
		return;
	}

	async _save(params) {
		const filePath = await this._prepareSaveFile(params);
		await fs.writeFile(filePath, this.dom.html());
		await this._commitSaveFile(params);
	}

	selectNode(key, valuePath, params) {
		const selector = valuePath.join(".");
		const nodes = this._selectNode(selector);
		if (nodes.length === 0) throw new Error(`node \`${selector}\` not found! `);
		if (nodes.length > 1)
			throw new Error(`node \`${selector}\` get ${nodes.length} nodes! `);
		return nodes[0];
	}

	getValueByConfig(key, valuePath, params = {}) {
		return this.selectNode(key, valuePath, params).text();
	}

	setValueByConfig(key, valuePath, value, params = {}) {
		this.selectNode(key, valuePath, params).text(value);
	}
}
