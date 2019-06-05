import Game from "./game";
import XMLSaveFile from "./save-file/xml-save-file";
import { castValueType, lodash } from "../utils";

class PlayerPrefsSaveFile extends XMLSaveFile {
	getValueByConfig(key, valuePath, params = {}) {
		valuePath = `[name="${valuePath[0]}"]`;
		const node = this.selectNode(key, valuePath, params);
		return node
			? castValueType(node.attr("value"), node.prop("name"))
			: undefined;
	}

	setValueByConfig(key, valuePath, value, params = {}) {
		valuePath = `[name="${valuePath[0]}"]`;
		const node = this.selectNode(key, valuePath, params);
		node.attr("value", value);
	}
}

export default class BestFiendsGame extends Game {
	constructor(name, config, params) {
		super(name, config, params);
		this.saveFileClasses = {
			...this.saveFileClasses,
			PlayerPrefsSaveFile: PlayerPrefsSaveFile
		};
	}

	isLocked(key) {
		const locked = super.isLocked(key);
		if (lodash.isUndefined(locked)) return true;
		return locked === 0;
	}

	unlock(key, lock) {
		super.unlock(key, lock ? 0 : 1);
	}
}
