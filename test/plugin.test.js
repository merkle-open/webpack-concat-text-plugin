import fs from "fs";
import path from "path";

jest.unmock("concat");
jest.unmock("glob");

/* eslint-disable import/imports-first */
import { compile, createCompiler, cleanErrorStack } from "./utils";
import ConcatTextPlugin, { PLUGIN_NAME } from "../src/index";
/* eslint-enable */

const cases = process.env.CASES ? process.env.CASES.split(",") : fs.readdirSync(path.join(__dirname, "cases"));

describe(PLUGIN_NAME, () => {
	cases.forEach((testCase) => {
		it(testCase, (done) => {

			const configFile = path.resolve("test", "cases", testCase, "config.js");
			const filename = `${testCase}.js`;

			const caseConfig = (fs.existsSync(configFile))
				? require(configFile) // eslint-disable-line global-require
				: {};

			const pluginConfig = Object.assign({}, caseConfig);
			const webpackConfig = {
				output: {
					filename,
					path: path.join(__dirname, "__output__", testCase, "dist")
				}
			};

			const compiler = createCompiler(webpackConfig);

			new ConcatTextPlugin(pluginConfig).apply(compiler);

			compile(compiler).then((stats) => {
				const errors = stats.compilation.errors.map(cleanErrorStack);
				const warnings = stats.compilation.warnings.map(cleanErrorStack);
				const files = stats.toJson().assets.filter((asset) => asset.name !== filename);

				expect(errors).toMatchSnapshot("errors");
				expect(warnings).toMatchSnapshot("warnings");

				files.forEach((asset) => {
					if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, asset.name)) {
						expect(stats.compilation.assets[asset.name].emitted).toBeTruthy();
						expect(stats.compilation.assets[asset.name].existsAt).toMatchSnapshot("path");
						expect(stats.compilation.assets[asset.name].source()).toMatchSnapshot("source");
					}
				});

				done();
			});
		});
	});
});
