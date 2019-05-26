import Game from "./game";

export default class MergeDragonsGame extends Game {
	constructor(name, config, params) {
		super(name, config, params);
	}

	getLockConfig(key) {
		const { is_premium_Land, lands } = this.config.locks[key];
		return { subTitle: is_premium_Land ? "Premium Land" : "" };
	}
	isLock(key) {
		const { is_premium_Land, lands } = this.config.locks[key];
	}

	setLock(key, lock) {
		this.setValue(key, lock);
	}
}
