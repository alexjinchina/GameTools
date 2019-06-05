import { fs, path, lodash, getPackageExternalDirectoryPath } from "../utils";
import { createSaveFile } from "./save-file";

export default class Game {
	constructor(name, config, params = {}) {
		this.name = name;
		this.config = config;
		this.saveFileClasses = {};

		this.params = lodash.defaults(params || {}, {
			info(msg) {
				console.info(msg);
				if (this.infoCallback) this.infoCallback(msg);
			},
			error(error) {
				console.warn(error.message || error.toString());
				if (this.errorCallback) this.errorCallback(error);
			}
		});

		this.saveFiles = {};
		this.modified = new Set();

		this.packageName = config.package_name;
		this.externalDirectoryPath = getPackageExternalDirectoryPath(
			this.packageName
		);
	}

	get packageName() {
		return this.config.package_name;
	}

	get externalDirectoryPath() {
		return getPackageExternalDirectoryPath(this.packageName);
	}

	parseFilePath(filePath) {
		if (filePath.startsWith("${ExternalDirectoryPath}"))
			return filePath.replace(
				"${ExternalDirectoryPath}",
				this.externalDirectoryPath
			);

		return filePath;
	}

	get tempSaveFilePath() {
		return path.join(
			fs.ExternalDirectoryPath,
			"game-save-files",
			this.packageName
		);
	}
	toString() {
		return `<Game: ${this.name}>`;
	}

	async load(params = {}) {
		params = lodash.defaults(params || {}, this.params);

		params.info(`loading ${this.name}...`);

		this.saveFiles = {};
		for (const [saveFileName, saveFileConfig] of lodash.toPairs(
			this.config.save_files
		)) {
			params.info(`loading save file ${saveFileName}...`);
			const saveFile = createSaveFile(
				this,
				saveFileName,
				saveFileConfig,
				params
			);

			await saveFile.load(params);
			this.saveFiles[saveFileName] = saveFile;
			// switch (saveFileConfig.type) {

			// }
		}
	}

	async save(params = {}) {
		params = lodash.defaults(params || {}, this.params);
		try {
			params.info(`saving ${this.name}...`);
			for (const modifiedSaveFile of this.modified) {
				const f = this.saveFiles[modifiedSaveFile];
				await f.save(params);
			}
			this.modified.clear();

			params.info(`${this.name} saved.`);
		} catch (error) {
			debugger;
			params.error(error);
		}
	}

	getValueKeys() {
		return lodash.keys(this.config.values);
	}

	getValueConfig(key) {
		return this.config.values[key];
	}
	getValue(key) {
		return this.getValueByConfig(key, this.getValueConfig(key));
	}

	setValue(key, value) {
		this.setValueByConfig(key, this.getValueConfig(key), value);
	}

	getLockKeys() {
		return lodash.keys(this.config.locks);
	}

	getLockConfig(key) {
		return this.config.locks[key];
	}

	isLocked(key) {
		return this.getValueByConfig(key, this.getLockConfig(key));
	}

	unlock(key, lock) {
		this.setValueByConfig(key, this.getLockConfig(key), lock);
	}

	getValueByConfig(key, config) {
		const { valuePath } = config;
		if (!valuePath) throw new Error(`valuePath of '${key}' not defined.`);
		const parts = valuePath.split(".");
		const saveFileName = parts.shift();
		const saveFile = this.saveFiles[saveFileName];
		if (!saveFile) return undefined;
		return saveFile.getValueByConfig(key, parts, config);
	}

	setValueByConfig(key, config, value) {
		const { valuePath } = config;
		if (!valuePath) throw new Error(`valuePath of '${key}' not defined.`);
		const parts = valuePath.split(".");
		const saveFileName = parts.shift();
		const saveFile = this.saveFiles[saveFileName];
		if (!saveFile) throw new Error(`save file ${saveFileName} not found`);
		saveFile.setValueByConfig(key, parts, value, config);
		this.modified.add(saveFileName);
	}
}
