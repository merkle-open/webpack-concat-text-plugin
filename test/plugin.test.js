import fs from "fs";
import path from "path";

jest.unmock("concat");
jest.unmock("glob");

/* eslint-disable import/imports-first */
import { compile, createCompiler, cleanErrorStack } from "./utils";
import ConcatTextPlugin, { getExtFromGlobPath, getRelativeTargetPath, globTextFiles, PLUGIN_NAME } from "../src/index";
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

	describe("Utility Functions", () => {

		it("can extract file type extension from glob path", () => {
			[ // Test Cases
				{ globPath: "test/*.js", expected: ".js" },
				{ globPath: "test/**/*.ts", expected: ".ts" },
				{ globPath: "test/(res|assets)/*.md", expected: ".md" },
				{ globPath: "test/{res|assets}/*.xml", expected: ".xml" }
			].forEach(({ globPath, expected }) => {
				const actual = getExtFromGlobPath(globPath);
				expect(actual).toBe(expected);
			});
		});

		it("can extract empty file type extension", () => {
			[ // Test Cases
				"test/*.test.{js,ts}",
				"test/*.js?(x)",
				"test/*.*sx",
				"test/*.[A-Z]",
				"test/*.*(htm|html)",
				"test/*.+(md|markdown)"
			].map(getExtFromGlobPath).forEach((expected) => {
				expect(expected).toHaveLength(0);
			});
		});

		it("can get relative target path", () => {
			const startingPath = path.join(__dirname, "test/");

			[ // Test Cases
				{ outputPath: "cases", expected: "cases" },
				{ outputPath: "../test", expected: "../test" },
				{ outputPath: "..", expected: ".." },
				{ outputPath: __dirname, expected: ".." },
				{ outputPath: path.join(__dirname, "/test/coverage"), expected: "coverage" },
				{ outputPath: path.join(__dirname, "/test/cases/foo"), expected: "cases/foo" },
				{ outputPath: path.join(__dirname, "/test"), expected: "" },
				{ outputPath: path.join(__dirname, "/dist/test"), expected: "../dist/test" }
			].forEach(({ outputPath, expected }) => {
				const actual = getRelativeTargetPath(startingPath, outputPath);
				expect(actual).toBe(expected);
			});
		});

		it("can glob files asynchronously", () => {
			return globTextFiles(`test/cases/{${cases.join(",")},}/*.js`)
				.then((actual) => {
					expect(actual).toHaveLength(cases.length);
				});
		});

	});

});
