import Game from "./game";
import MergeDragonsGame from "./merge-dragons-game";
import BestFiendsGame from "./best-fiends-game";

const GAME_CLASSES = {
	merge_dragons: MergeDragonsGame,
	best_fiends: BestFiendsGame
};

export default function createGame(name, config, params = {}) {
	return new (GAME_CLASSES[name] || Game)(name, config, params);
}
