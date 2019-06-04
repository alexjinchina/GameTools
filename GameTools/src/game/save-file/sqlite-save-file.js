import { NativeModules } from "react-native";

import { lodash, Permission, path, fs } from "../../utils";

import SaveFile from "./save-file";

const SaveFileHelper = NativeModules.SaveFileHelper;
SaveFileHelper.setLoggingLevel(__DEV__ ? "debug" : "info");

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

export default class SQLiteSaveFile extends SaveFile {
	constructor(game, name, config, params = {}) {
		super(game, name, config, params);
		this.data = null;
		this.modified = new Set();
	}

	async _load(params) {
		const filePath = await this._prepareLoadFile(params);

		params.info(`${this}: loading data...`);
		const tables = await SaveFileHelper.loadSQLiteData(filePath, this.config);

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
	}

	async _save(params) {
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

		const filePath = await this._prepareSaveFile(params);
		await SaveFileHelper.updateSQLiteData(filePath, this.config, modifiedData);
		await this._commitSaveFile(params);
		this.modified.clear();
	}

	getValueByConfig(key, valuePath, params = {}) {
		const parts = lodash.isString(valuePath) ? valuePath.split(".") : valuePath;
		const tableName = parts.shift();
		const table = this.tables[tableName];
		if (!table) return undefined;

		const rowId = parts.shift();
		const row = table[rowId];
		if (!row) return undefined;

		return lodash.get(row, parts.join("."));
	}

	setValueByConfig(key, valuePath, value, params = {}) {
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
