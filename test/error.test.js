import path from "path";
import concat from "concat";
import glob from "glob";

jest.mock("concat");
jest.mock("glob");

/* eslint-disable import/imports-first */
import { compile, createCompiler, cleanErrorStack } from "./utils";
import ConcatTextPlugin, { PLUGIN_NAME } from "../index";
/* eslint-enable */

describe(PLUGIN_NAME, () => {

	const pluginConfig = {
		files: path.join(__dirname, "*.properties"),
		name: "frontend.properties",
		outputPath: path.join(__dirname)
	};

	it("throws error when failing to glob files", () => {
		glob.mockImplementation((_, callback) => {
			callback(new Error("Glob Error"), "");
		});

		const compiler = createCompiler();

		new ConcatTextPlugin(pluginConfig).apply(compiler);

		return compile(compiler)
			.then(() => fail("should've caught an error"))
			.catch((e) => {
				expect(cleanErrorStack(e)).toMatchSnapshot();
			});
	});

	it("throws error when failing to concat files", () => {
		glob.mockImplementation((_, callback) => {
			callback(null, "path");
		});

		concat.mockImplementation(() => {
			return Promise.reject(new Error("Concat Error"));
		});

		const compiler = createCompiler();

		new ConcatTextPlugin(pluginConfig).apply(compiler);

		return compile(compiler)
			.then(() => fail("should've caught an error"))
			.catch((e) => {
				expect(cleanErrorStack(e)).toMatchSnapshot();
			});
	});

});
