import Game from "./game";
import { lodash } from "../utils";

export default class BestFiendsGame extends Game {
	constructor(name, config, params) {
		super(name, config, params);
		this.saveFileClasses = {
			...this.saveFileClasses
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
