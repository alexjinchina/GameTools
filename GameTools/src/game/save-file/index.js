import {} from "../../utils";

function detectType(filename) {
  if (!filename) return undefined;
  filename = filename.toLower();
  if (filename.endsWith(".db")) return "sqlite";
  if (filename.endsWith(".xml")) return "xml";
  return;
}

export function createSaveFile(game, name, config, params = {}) {
  const { type, file } = config;
  const modName = `./sqlite`
  const mod = require(modName);
  const saveFile = new mod.default(game, name, config, params || {});

  return saveFile;
}
