module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true,
		"react-native/react-native": true
	},
	extends: ["eslint:recommended", "plugin:prettier/recommended"],
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
	plugins: ["react", "react-native", "prettier"],
	rules: {
		"no-debugger": "warn",
		"no-console": "warn",
		"react/jsx-uses-vars": "warn",
		"no-unused-vars": "warn"
	}
};
