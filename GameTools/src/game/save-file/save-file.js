import { lodash, Permission, path, fs } from "../../utils";

export default class SaveFile {
	constructor(game, name, config, params = {}) {
		this.game = game;
		this.name = name;
		this.config = config;
		this.params = lodash.defaults(params || {}, this.game.params);
		this._loadedFilePath = null;
	}

	toString() {
		return `<${this.constructor.name}: ${this.name}>`;
	}

	get remoteFilePath() {
		return this.game.parseFilePath(this.config.file);
	}
	get localFilePath() {
		return path.join(this.game.tempSaveFilePath, this.name);
	}

	async load(params = {}) {
		try {
			params = lodash.defaults(params, this.params);
			params.info(`${this}: request permission...`);
			await Permission.request(Permission.READ_EXTERNAL_STORAGE);
			return await this._load(params);
		} catch (error) {
			params.error(error);
		}
	}
	async _load(params) {
		throw new Error(
			`class \`${this.constructor.name}\` not implement method \`_load\`!`
		);
	}

	async _tryLoad(loadFunc, ignoredErrors, params) {
		const remoteFilePath = this.remoteFilePath;
		const localFilePath = this.localFilePath;
		try {
			params.info(`${this}: loading from ${remoteFilePath}...`);
			const r = await loadFunc(remoteFilePath);
			this._loadedFilePath = remoteFilePath;
			return r;
		} catch (error) {
			console.debug(error.message);
			if (!ignoredErrors || !ignoredErrors(error)) {
				throw error;
			}
		}
		params.info(`${this}: making local dir...`);
		await fs.mkdir(path.dirname(localFilePath));
		params.info(`${this}: copying remote db...`);
		await fs.copyFile(remoteFilePath, localFilePath);
		params.info(`${this}: loading from ${localFilePath}...`);

		const r = await loadFunc(localFilePath);
		this._loadedFilePath = localFilePath;
		return r;
	}

	async save(params = {}) {
		try {
			params = lodash.defaults(params, this.params);
			params.info(`${this}: request permission...`);
			await Permission.request(Permission.WRITE_EXTERNAL_STORAGE);
			return await this._save(params);
		} catch (error) {
			params.error(error);
		}
	}

	async _save(params) {
		throw new Error(
			`class \`${this.constructor.name}\` not implement method \`_save\`!`
		);
	}

	async _trySave(saveFunc, params) {
		const remoteFilePath = this.remoteFilePath;
		const localFilePath = this.localFilePath;
		const r = await saveFunc(this._loadedFilePath);
		if (this._loadedFilePath === localFilePath) {
			params.info(`${this}: copying to remote file...`);
			await fs.copyFile(localFilePath, remoteFilePath);
		}

		return r;
	}

	getValueByPath(valuePath) {
		throw new Error(
			`class \`${
				this.constructor.name
			}\` not implement method \`getValueByPath\`!`
		);
	}

	setValueByPath(valuePath) {
		throw new Error(
			`class \`${
				this.constructor.name
			}\` not implement method \`setValueByPath\`!`
		);
	}
}
