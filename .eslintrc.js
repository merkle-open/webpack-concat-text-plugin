module.exports = {
	extends: [
		"@namics/eslint-config/configurations/es8-browser.js"
	],
	rules: {
		"quotes": [2, "double", { avoidEscape: true }],
		"comma-dangle": ["error", {
			"arrays": "never",
			"objects": "never",
			"imports": "never",
			"exports": "never",
			"functions": "ignore"
		}],
		"wrap-iife": ["error", "inside"],
		"no-inline-comments": 0,
		"default-case": 0,
		"id-blacklist": 0,
		"no-lonely-if": 0
	},
	parser: "babel-eslint",
	env: {
		node: true,
		jest: true
	}
};
