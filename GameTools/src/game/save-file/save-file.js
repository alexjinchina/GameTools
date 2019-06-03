import { NativeModules } from "react-native";
const { GameHelper } = NativeModules;
const { rootExec } = GameHelper;
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

	async _prepareLoadFile(params) {
		const remoteFilePath = this.remoteFilePath;
		const localFilePath = this.localFilePath;

		this._loadedFilePath = null;
		try {
			params.info(`${this}: checking remote file...`);
			await fs.read(remoteFilePath, 1, 0);
			this._loadedFilePath = remoteFilePath;
		} catch (error) {
			if (error.code !== "ENOENT") {
				debugger;
				throw error;
			}
			params.info(`${this}: cannot read remote file`);
			console.debug(error.message);
		}

		if (!this._loadedFilePath) {
			params.info(`${this}: making local dir...`);
			await fs.mkdir(path.dirname(localFilePath));

			try {
				params.info(`${this}: root-copying remote file...`);
				const r = await rootExec(`cp "${remoteFilePath}" "${localFilePath}"`);
				debugger;
				if (r.exitValue !== 0) {
					throw new Error(
						`root copy failed(${r.exitValue})!\n${r.stderr}\n${r.stdout}`
					);
				}

				this._loadedFilePath = localFilePath;
			} catch (error) {
				if (error.code !== "ENOENT") {
					debugger;
					throw error;
				}
				console.debug(error.message);
			}
		}

		return this._loadedFilePath;
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

	async _prepareSaveFile(params) {
		return this._loadedFilePath;
	}

	async _commitSaveFile(params) {
		const remoteFilePath = this.remoteFilePath;
		const localFilePath = this.localFilePath;
		if (this._loadedFilePath === localFilePath) {
			params.info(`${this}: root-copying to remote file...`);
			const r = await rootExec(`cp "${localFilePath}" "${remoteFilePath}"`);
			if (r.exitValue !== 0) {
				throw new Error(`root copy failed(${r})!`);
			}
		}

		params.info(`${this}: save file commited`);
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
