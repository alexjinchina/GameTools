import XMLSaveFile from "./xml-save-file";
import { castValueType, lodash } from "../../utils";

export default class SharedPrefsSaveFile extends XMLSaveFile {
	getValueByConfig(key, valuePath, params = {}) {
		valuePath = `[name="${valuePath[0]}"]`;
		const node = this.selectNode(key, valuePath, params);
		return node
			? castValueType(node.attr("value"), node.prop("name"))
			: undefined;
	}

	setValueByConfig(key, valuePath, value, params = {}) {
		const name = valuePath[0];
		valuePath = `[name="${name}"]`;
		const node = this.selectNode(key, valuePath, params);
		if (!node) {
			let type = "string";
			switch (typeof value) {
				case "number":
					type = lodash.isInteger(value) ? "int" : "float";
					break;
			}
			this.dom(`<${type} name="${name}" value="${value}"/>`).appendTo(
				this.dom(":root")
			);
		} else {
			node.attr("value", value);
		}
	}
}
