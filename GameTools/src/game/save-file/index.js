import {} from "../../utils";

function detectType(filename) {
  if (!filename) return undefined;
  filename = filename.toLower();
  if (filename.endsWith(".db")) return "sqlite";
  if (filename.endsWith(".xml")) return "xml";
  return;
}

const saveFileClasses = {
  sqlite: require("./sqlite").default
};

export function createSaveFile(game, name, config, params = {}) {
  const { type, file } = config;
  const cls = saveFileClasses[type || detectType(file)];
  const saveFile = new cls(game, name, config, params || {});

  return saveFile;
}
