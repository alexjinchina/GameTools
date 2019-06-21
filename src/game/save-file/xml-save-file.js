import cheerio from "react-native-cheerio";

import SaveFile from "./save-file";
import { fs, lodash, formatXml } from "../../utils";

export class NodeNotFoundError extends Error {
	constructor(selector) {
		super(`node \`${selector}\` not found!`);
		this.selector = selector;
	}
}

export class MultiNodesFoundError extends Error {
	constructor(selector, nodes) {
		super(`node \`${selector}\` get ${nodes.length} nodes!`);
		this.selector = selector;
		this.nodes = nodes;
	}
}

export default class XMLSaveFile extends SaveFile {
	constructor(game, name, config, params = {}) {
		super(game, name, config, params);
		this.dom = null;
		this.modified = false;
	}

	async _load(params) {
		const filePath = await this._prepareLoadFile(params);
		this.dom = await cheerio.load(await fs.readFileAsync(filePath), {
			xml: {
				normalizeWhitespace: true
			}
		});
		this.modified = false;
		return;
	}

	async _save(params) {
		const filePath = await this._prepareSaveFile(params);
		await fs.writeFileAsync(
			filePath,
			formatXml(this.dom.xml(), {
				collapseContent: true
			})
		);
		await this._commitSaveFile(params);
		this.modified = false;
	}

	get root() {
		return this.$(":root");
	}

	get $() {
		return this.dom;
	}

	_selectNode(selector) {
		return this.root.find(selector);
	}

	selectNode(key, valuePath, params) {
		const selector = lodash.isArray(valuePath)
			? valuePath.join(".")
			: valuePath;
		const nodes = this._selectNode(selector);
		if (nodes.length === 0) {
			return null;
			// throw new NodeNotFoundError(selector);
		}
		if (nodes.length > 1) throw new MultiNodesFoundError(selector, nodes);
		return this.dom(nodes[0]);
	}

	getValueByConfig(key, valuePath, params = {}) {
		const node = this.selectNode(key, valuePath, params);
		return node ? node.text() : undefined;
	}

	setValueByConfig(key, valuePath, value, params = {}) {
		const node = this.selectNode(key, valuePath, params);
		if (node) {
			node.text(value);
			this.modified = true;
		}
	}
}
