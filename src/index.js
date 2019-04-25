import path from "path";
import glob from "glob";
import concat from "concat";

import { RawSource } from "webpack-sources";

export const PLUGIN_NAME = "ConcatTextPlugin";

/**
 * Extract a file extension from a glob path.
 * If multiple file types are being matched by the glob (e.g. `*.{txt,properties}`
 * or `*.tsx?`), an empty string will be returned.
 *
 * @param {string} globPath The glob path from which to extract a file type extension.
 * @returns {string} The extracted extension. Can be an empty string.
 */
export function getExtFromGlobPath(globPath) {
	const extname = path.extname(globPath);

	return glob.hasMagic(extname) ? "" : extname;
}

/**
 * Async function to `glob` files.
 *
 * @param {string} globPath The glob path.
 * @returns {Promise<string[]>} An Array of globbed files.
 */
export async function globTextFiles(globPath) {
	return new Promise((resolve, reject) => {
		glob(globPath, (er, files) => {
			if (er) { reject(er); }

			resolve(files);
		});
	});
}

/**
 * Gets the concatenation target location as a relative path based on the
 * `startingPath` (Webpacks `output.path`) and the configured `outputPath`.
 * If the `outputPath` is already a relative path,  we'll just return it.
 * Otherwise, if it is an absolute path, we determine its location as a
 * path relative to the `startingPath`.
 *
 * @param {string} startingPath The absolute starting path.
 * @param {string} outputPath The absolute or relative output path.
 * @returns {string} The relative target path.
 */
export function getRelativeTargetPath(startingPath, outputPath) {
	return path.isAbsolute(outputPath)
		? path.relative(startingPath, outputPath)
		: outputPath;
}

/**
 * The `ConcatTextPlugin` for Webpack to concatenate
 * text files into a single one.
 */
export default class ConcatTextPlugin {

	/**
	 *
	 * @param {{ files: string, outputPath: string, name: string }} options The options object.
	 */
	constructor(options) {
		this.options = options;
	}

	/**
	 * Concatenates all the text files that we could glob into a
	 * single file located at `this.options.target`.
	 *
	 * @param {webpack.Compilation} compilation The Webpack compilation object.
	 * @returns {Promise} Rejected Error.
	 */
	emitText(compilation) {
		return new Promise(async (resolve, reject) => {
			try {
				const files = await globTextFiles(this.options.files);
				const result = await concat(files);

				compilation.assets[this.options.target] = new RawSource(result);

				resolve();
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 *
	 * @param {webpack.Compiler} compiler The Webpack compiler instance.
	 * @returns {void}
	 */
	apply(compiler) {
		const filename = path.basename(compiler.options.output.filename, path.extname(compiler.options.output.filename));
		const extname = getExtFromGlobPath(this.options.files);

		this.options = Object.assign(
			{},
			{
				outputPath: compiler.options.output.path,
				name: filename + extname
			},
			this.options
		);

		this.options.target = path.join(
			getRelativeTargetPath(compiler.options.output.path, this.options.outputPath),
			this.options.name
		);

		compiler.hooks.emit.tapPromise(PLUGIN_NAME, this.emitText.bind(this));
	}

}
