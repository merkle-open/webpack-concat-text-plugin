import path from "path";
import glob from "glob";
import concat from "concat";

import { RawSource } from "webpack-sources";

export const PLUGIN_NAME = "ConcatTextPlugin";

/**
 * Extract a file extension from a glob path.
 * If multiple file types are being matched by the glob (e.g. `*.{txt,properties}`
 * or `*.ts?(x)`), an empty string will be returned.
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
 * If the `outputPath` is already a relative path, we'll just return it.
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
 * Merges the passed plugin options with defaults based on the
 * Webpack compiler's `output` options, like `output.filename` and `output.path`.
 *
 * @param {{ filename: string, path: string }} outputOptions The webpack compiler instance.
 * @param {{ files: string, outputPath: string, name: string }} options The options object.
 * @returns {{ files: string, outputPath: string, name: string }} options The merged options object.
 */
export function mergeWithOutputOptions({ filename, path: outputPath }, options) {
	const basename = path.basename(filename, path.extname(filename));
	const extname = getExtFromGlobPath(options.files);

	const defaultOptions = {
		outputPath,
		name: basename + extname
	};

	return Object.assign({}, defaultOptions, options);
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
	 * @param {string} target The target path (including filename) of the concatenated asset.
	 * @returns {Promise} Rejected Error.
	 */
	emitText(compilation, target) {
		return new Promise(async (resolve, reject) => {
			try {
				const files = await globTextFiles(this.options.files);
				const result = await concat(files);

				compilation.assets[target] = new RawSource(result);

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
		this.options = mergeWithOutputOptions(compiler.options.output, this.options);

		compiler.hooks.emit.tapPromise(PLUGIN_NAME, (compilation) => {
			const target = path.join(
				getRelativeTargetPath(compiler.options.output.path, this.options.outputPath),
				this.options.name
			);

			return this.emitText(compilation, target);
		});
	}

}
