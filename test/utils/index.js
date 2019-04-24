import path from "path";

import MemoryFileSystem from "memory-fs"; // eslint-disable-line
import webpack from "webpack";

/* eslint-disable require-jsdoc */

export class PluginEnvironment {
	constructor() {
		this.events = [];
	}

	getEnvironmentStub() {
		return {
			plugin: (name, handler) => {
				this.events.push({
					name,
					handler
				});
			}
		};
	}

	getEventBindings() {
		return this.events;
	}
}

export function compile(compiler) {
	return new Promise((resolve, reject) => {
		// eslint-disable-line consistent-return
		compiler.run((err, stats) => {
			if (err) {
				return reject(err);
			}

			return resolve(stats);
		});
	});
}

export function createCompiler(options = {}) {
	const compiler = webpack(
		Array.isArray(options)
			? options
			: Object.assign({
				mode: "production",
				bail: true,
				cache: false,
				entry: "./index.js",
				optimization: {
					minimize: false
				},
				output: {
					pathinfo: false,
					path: `${__dirname}/__output__`,
					filename: "[name].[chunkhash].js",
					chunkFilename: "[id].[name].[chunkhash].js"
				},
				target: "node",
				plugins: []
			}, options)
	);

	compiler.outputFileSystem = new MemoryFileSystem();

	return compiler;
}

export function countPlugins({ hooks }) {
	return Object.keys(hooks).reduce((aggregate, name) => {
		// eslint-disable-next-line no-param-reassign
		aggregate[name] = Array.isArray(hooks[name].taps)
			? hooks[name].taps.length
			: 0;
		return aggregate;
	}, {});
}

export function removeCWD(str) {
	return str.split(`${process.cwd()}/`).join("");
}

export function normalizeSourceMap(source) {
	if (source.map && source.map.sources) {
		// eslint-disable-next-line no-param-reassign
		source.map.sources = source.map.sources.map((sourceFromMap) =>
			path.relative(process.cwd(), sourceFromMap).replace(/\\/g, "/")
		);
	}

	return source;
}

export function cleanErrorStack(error) {
	return removeCWD(error.toString())
		.split("\n")
		.slice(0, 2)
		.join("\n");
}
