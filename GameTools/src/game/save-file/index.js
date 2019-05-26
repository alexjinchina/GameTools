import {} from "../../utils";

import SQLiteSaveFile from "./sqlite";

function detectType(filename) {
	if (!filename) return undefined;
	filename = filename.toLower();
	if (filename.endsWith(".db")) return "sqlite";
	if (filename.endsWith(".xml")) return "xml";
	return;
}

const SAVE_FILE_CLASSES = {
	sqlite: SQLiteSaveFile
};

export function createSaveFile(game, name, config, params = {}) {
	const { type, file } = config;
	const cls = SAVE_FILE_CLASSES[type || detectType(file)];
	const saveFile = new cls(game, name, config, params || {});

	return saveFile;
}
