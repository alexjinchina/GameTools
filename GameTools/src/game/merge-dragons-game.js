import Game from "./game";

export default class MergeDragonsGame extends Game {
	constructor(name, config, params) {
		super(name, config, params);
	}

	isLockByKey(key) {
		const { is_premium_Land, lands } = this.config.locks[key];
	}
}
