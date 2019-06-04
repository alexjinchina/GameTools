import Game from "./game";
import { lodash } from "../utils";

const LOCK_FLAG_NONE = "NONE";

const MD_DB = "md_db";
const TABLE_STORAGE = "storage";
const FILE_LEVEL_HOME = "Level_Home";

export default class MergeDragonsGame extends Game {
	constructor(name, config, params) {
		super(name, config, params);
	}

	get md_db() {
		return this.saveFiles[MD_DB];
	}

	get storage() {
		return this.md_db.tables[TABLE_STORAGE];
	}

	get levelHome() {
		return this.storage[FILE_LEVEL_HOME];
	}

	getLandsLockFlags() {
		return lodash.get(this.levelHome, `data.1.1.0`);
	}

	getLandsData() {
		return lodash.get(this.levelHome, `data.1.0`);
	}

	getLockConfig(key) {
		const { is_premium_Land, lands } = this.config.locks[key];
		return {
			subTitle: is_premium_Land ? "Premium Land" : "",
			editable: this.isLocked(key) === true
		};
	}
	isLocked(key) {
		// const { is_premium_Land, lands } = this.config.locks[key];
		// return this.lockedAreas.has(key);
		if (lodash.isUndefined(this.config.locks[key])) return undefined;

		return lodash.some(this.getLandsLockFlags(), ys =>
			lodash.some(ys, lock => lock === key)
		);
	}

	unlock(key) {
		if (lodash.isUndefined(this.config.locks[key])) {
			throw new Error(`invalid lock flag ${key}!`);
		}

		const { lands } = this.config.locks[key];

		const landsLockState = this.getLandsLockFlags();
		const landsData = this.getLandsData();

		lands.forEach(([x, y]) => {
			landsLockState[x][y] = LOCK_FLAG_NONE;
			landsData[`${x}_${y}`] = {
				"0": x,
				"1": y,
				...this.config.empty_land_data
			};
		});

		this.md_db.setModified(TABLE_STORAGE, FILE_LEVEL_HOME);
		this.modified.add(MD_DB);
	}
}
