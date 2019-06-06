module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true,
		"react-native/react-native": true
	},
	extends: [
		"eslint:recommended",
		"plugin:prettier/recommended",
		"plugin:import/errors",
		"plugin:import/warnings"
	],
	globals: {
		Atomics: "readonly",
		SharedArrayBuffer: "readonly"
	},
	parserOptions: {
		ecmaFeatures: {
			jsx: true
		},
		ecmaVersion: 2018,
		sourceType: "module"
	},
	plugins: ["react", "react-native", "prettier", "import"],
	rules: {
		"no-debugger": "warn",
		"no-console": "warn",
		"react/jsx-uses-vars": "warn",
		"no-unused-vars": "warn"
	}
};
