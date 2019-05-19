import { fs, path, lodash, getPackageExternalDirectoryPath } from "../utils";
import { createSaveFile } from "./save-file";

export default class Game {
  constructor(name, config, params = {}) {
    this.name = name;
    this.config = config;

    this.params = lodash.defaults(params || {}, {
      info(msg) {
        console.info(msg);
        if (this.infoCallback) this.infoCallback(msg);
      },
      error(error) {
        console.error(error.message || error.toString());
        if (this.errorCallback) this.infoCallback(error);
      }
    });

    this.saveFiles = {};

    this.packageName = config.package_name;
    this.externalDirectoryPath = getPackageExternalDirectoryPath(
      this.packageName
    );
  }

  get packageName() {
    return this.config.package_name;
  }

  get externalDirectoryPath() {
    return getPackageExternalDirectoryPath(this.packageName);
  }

  parseFilePath(filePath) {
    if (filePath.startsWith("${ExternalDirectoryPath}"))
      return filePath.replace(
        "${ExternalDirectoryPath}",
        this.externalDirectoryPath
      );

    return filePath;
  }

  get tempSaveFilePath() {
    return path.join(
      fs.ExternalDirectoryPath,
      "game-safe-files",
      this.packageName
    );
  }
  toString() {
    return `<Game: ${this.name}>`;
  }

  async load(params = {}) {
    params = lodash.defaults(params || {}, this.params);

    params.info(`loading ${this.name}...`);

    this.saveFiles = {};
    for (const [saveFileName, saveFileConfig] of lodash.toPairs(
      this.config.save_files
    )) {
      params.info(`loading save file ${saveFileName}...`);
      const saveFile = createSaveFile(
        this,
        saveFileName,
        saveFileConfig,
        params
      );

      await saveFile.load(params);
      // switch (saveFileConfig.type) {

      // }
    }
  }
}
