import Game from "./game";
import MergeDragonsGame from "./merge-dragons-game";
const GAME_CLASSES = {
	merge_dragons: MergeDragonsGame
};

export default function createGame(name, config, params) {
	return new (GAME_CLASSES[name] || Game)(name, config, params);
}
