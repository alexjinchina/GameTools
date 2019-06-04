import Game from "./game";
import XMLSaveFile from "./save-file/xml-save-file";

class PlayerPrefsSaveFile extends XMLSaveFile {
	getValueByConfig(key, valuePath, params = {}) {
		return this.selectNode(key, valuePath, params).text();
	}

	setValueByConfig(key, valuePath, value, params = {}) {
		this.selectNode(key, valuePath, params).text(value);
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
}
