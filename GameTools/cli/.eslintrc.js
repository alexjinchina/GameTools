module.exports = {
	env: {
		es6: true,
		node: true
	},
	extends: ["eslint:recommended", "plugin:prettier/recommended"],
	globals: {
		Atomics: "readonly",
		SharedArrayBuffer: "readonly"
	},
	parserOptions: {
		ecmaFeatures: {},
		ecmaVersion: 2018,
		sourceType: "module"
	},
	plugins: ["prettier"],
	rules: {
		"no-debugger": "warn",
		"no-console": "off"
	}
};
