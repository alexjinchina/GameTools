import { NativeModules } from "react-native";

import { lodash, Permission, path, fs } from "../../utils";

const SaveFileHelper = NativeModules.SaveFileHelper;
SaveFileHelper.setLoggingLevel(__DEV__ ? "debug" : "info");

function saveFieldToDB(obj, key, fieldType) {
	switch (fieldType) {
		case "json":
			obj[key] = JSON.stringify(obj[key]);
			break;
	}
}
function castRowFromDB(row, config) {
	lodash.forEach(config, (fieldType, fieldName) => {
		switch (fieldType) {
			case "json":
				row[fieldName] = JSON.parse(row[fieldName]);
				break;
		}
	});
}

function castRowToDB(row, config) {
	row = lodash.cloneDeep(row);
	lodash.forEach(config, (fieldType, fieldName) => {
		switch (fieldType) {
			case "json":
				row[fieldName] = JSON.stringify(row[fieldName]);
				break;
		}
	});
	return row;
}

export default class SQLiteSaveFile {
	constructor(game, name, config, params = {}) {
		this.game = game;
		this.name = name;
		this.config = config;
		this.params = lodash.defaults(params || {}, this.game.params);
		this.data = null;
		this.dbPath = null;
		this.modified = new Set();
	}

	toString() {
		return `<${this.constructor.name}: ${this.name}>`;
	}

	get remoteDBPath() {
		return this.game.parseFilePath(this.config.file);
	}
	get localDBPath() {
		return path.join(this.game.tempSaveFilePath, this.name);
	}

	async load(params) {
		try {
			params = lodash.defaults(params, this.params);
			const tables = await this._loadData(params);
			params.info(`${this}: parsing data...`);
			lodash.forEach(this.config.tables, (config, tableName) => {
				// console.debug(`parsing table ${tableName}...`);
				if (!lodash.isPlainObject(config.fields)) return;
				const table = tables[tableName];
				if (!table) return;
				lodash.forEach(table, (row, rowId) => {
					// console.debug(`parsing table ${tableName} row ${rowId}...`);
					castRowFromDB(row, config.fields);
				});
			});
			this.tables = tables;
			this.modified.clear();
		} catch (error) {
			params.error(error);
		}
	}

	async save(params = {}) {
		try {
			const modifiedData = lodash.map(Array.from(this.modified), modified => {
				const [tableName, rowId] = modified.split(",");
				const table = this.tables[tableName];
				const config = this.config.tables[tableName];
				const row = castRowToDB(table[rowId], config.fields);
				return {
					tableName,
					keyField: config.key,
					rowId,
					row
				};
			});

			await this._saveData(modifiedData, params);
			this.modified.clear();
		} catch (error) {
			params.error(error);
		}
	}

	async _loadData(params) {
		params.info(`${this}: loading sqlite db ...`);
		const remoteDBPath = this.remoteDBPath;
		const localDBPath = this.localDBPath;
		params.info(`${this}: request permission...`);
		await Permission.request(Permission.READ_EXTERNAL_STORAGE);
		try {
			const data = await SaveFileHelper.loadSQLiteData(
				remoteDBPath,
				this.config
			);
			this.dbPath = remoteDBPath;
			return data;
		} catch (error) {
			switch (error.code) {
				case "SQLiteCantOpenDatabaseException":
					console.debug(error.message);
					break;
				default:
					throw error;
			}
		}
		params.info(`${this}: making local dir...`);
		await fs.mkdir(path.dirname(localDBPath));
		params.info(`${this}: copying remote db...`);
		await fs.copyFile(remoteDBPath, localDBPath);
		params.info(`${this}: loading data...`);
		const data = await SaveFileHelper.loadSQLiteData(localDBPath, this.config);
		this.dbPath = localDBPath;
		return data;
	}

	async _saveData(data, params) {
		params.info(`${this}: saving sqlite db ...`);
		const remoteDBPath = this.remoteDBPath;
		const localDBPath = this.localDBPath;
		params.info(`${this}: request permission...`);
		await Permission.request(Permission.WRITE_EXTERNAL_STORAGE);
		await SaveFileHelper.updateSQLiteData(this.dbPath, this.config, data);
		if (this.dbPath === localDBPath) {
			params.info(`${this}: copying to remote db...`);
			await fs.copyFile(localDBPath, remoteDBPath);
		}
	}

	getValueByPath(valuePath) {
		const parts = lodash.isString(valuePath) ? valuePath.split(".") : valuePath;
		const tableName = parts.shift();
		const table = this.tables[tableName];
		if (!table) return undefined;

		const rowId = parts.shift();
		const row = table[rowId];
		if (!row) return undefined;

		return lodash.get(row, parts.join("."));
	}

	setValueByPath(valuePath, key, value) {
		const parts = lodash.isString(valuePath) ? valuePath.split(".") : valuePath;
		const tableName = parts.shift();
		const table = this.tables[tableName];
		if (!table) throw new Error(`sqlite db table ${tableName} not found!`);
		const rowId = parts.shift();
		const row = table[rowId];
		if (!row)
			throw new Error(`sqlite db table ${tableName} row ${rowId} not found!`);
		lodash.set(row, parts.join("."), value);
		this.setModified(tableName, rowId);
	}

	setModified(tableName, rowId) {
		this.modified.add([tableName, rowId].join(","));
	}
}
