import {} from "../../utils";

import SQLiteSaveFile from "./sqlite-save-file";
import XMLSaveFile from "./xml-save-file";

function detectType(filename) {
	if (!filename) return undefined;
	filename = filename.toLowerCase();
	if (filename.endsWith(".db")) return "sqlite";
	if (filename.endsWith(".xml")) return "xml";
	return;
}

const SAVE_FILE_CLASSES = {
	sqlite: SQLiteSaveFile,
	xml: XMLSaveFile
};

export function createSaveFile(game, name, config, params = {}) {
	const { type, file, class: className } = config;
	const cls =
		game.saveFileClasses[className] ||
		SAVE_FILE_CLASSES[type || detectType(file)];
	if (!cls) throw new Error(`unknown file type of ${file}`);
	const saveFile = new cls(game, name, config, params || {});

	return saveFile;
}
