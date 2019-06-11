import { lodash, Permission, path, fs, GameHelper } from "../../utils";
const { rootExec } = GameHelper;

async function isRooted() {
	try {
		const r = await rootExec("echo ROOTED");
		console.debug(r);
		return true;
	} catch (error) {
		console.debug(error);
		if (error.code === "IOException") {
			console.info(error.message);
			return false;
		}
		debugger;
		throw error;
	}
}

export default class SaveFile {
	constructor(game, name, config, params = {}) {
		this.game = game;
		this.name = name;
		this.config = config;
		this.params = lodash.defaults(params || {}, this.game.params);
		this._loadInfo = null;
	}

	toString() {
		return `<${this.constructor.name}: ${this.name}>`;
	}

	get remoteFilePath() {
		return this.game.resolveFilePath(this.config.file);
	}
	get localFilePath() {
		return path.join(this.game.localSaveFileDir, this.name);
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

		this._loadInfo = null;
		try {
			params.info(`${this}: checking remote file...`);
			const stat = await fs.stat(remoteFilePath);
			await fs.read(remoteFilePath, 1, 0);
			this._loadInfo = { filePath: remoteFilePath };
			return this._loadInfo.filePath;
		} catch (error) {
			if (error.code !== "ENOENT" && error.code !== "EUNSPECIFIED") {
				debugger;
				throw error;
			}
			params.info(`${this}: ${error.message}`);
		}
		if (!(await isRooted())) {
			console.debug("not rooted!");

			if (__DEV__) {
				this._loadInfo = { filePath: localFilePath, needCopyToRemote: false };
				return this._loadInfo.filePath;
			}
			throw new Error(`file not exists(or system not rooted)!`);
		}

		console.debug("rooted");
		const r = await rootExec(`ls "${remoteFilePath}"`);
		if (r.exitValue !== 0) {
			throw new Error(
				`file not exists(${r.exitValue})!\n${r.stderr}\n${r.stdout}!`
			);
		}

		params.info(`${this}: making local dir...`);
		await fs.mkdir(path.dirname(localFilePath));

		params.info(`${this}: root-copying remote file...`);
		const copyResult = await rootExec(
			`cp "${remoteFilePath}" "${localFilePath}"`
		);
		if (copyResult.exitValue !== 0) {
			throw new Error(
				`root copy failed(${copyResult.exitValue})!\n${copyResult.stderr}\n${
					copyResult.stdout
				}`
			);
		}

		this._loadInfo = { filePath: localFilePath, needCopyToRemote: true };
		return this._loadInfo.filePath;
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
		if (!this._loadInfo) throw new Error(`not loaded!`);
		return this._loadInfo.filePath;
	}

	async _commitSaveFile(params) {
		if (!this._loadInfo) throw new Error(`not loaded!`);
		const remoteFilePath = this.remoteFilePath;
		if (this._loadInfo.needCopyToRemote) {
			if (!(await isRooted())) {
				console.debug("not rooted!");
				throw new Error(`file not exists(system not rooted)!`);
			} else {
				params.info(`${this}: root-copying to remote file...`);
				const r = await rootExec(
					`cp "${this._loadInfo.filePath}" "${remoteFilePath}"`
				);
				if (r.exitValue !== 0) {
					throw new Error(
						`root copy failed(${r.exitValue})!\n${r.stderr}\n${r.stdout}`
					);
				}
			}
		}

		params.info(`${this}: save file commited`);
	}

	getValueByConfig() {
		throw new Error(
			`class \`${
				this.constructor.name
			}\` not implement method \`getValueByConfig\`!`
		);
	}

	setValueByConfig() {
		throw new Error(
			`class \`${
				this.constructor.name
			}\` not implement method \`setValueByConfig\`!`
		);
	}
}
