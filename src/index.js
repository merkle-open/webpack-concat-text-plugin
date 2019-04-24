import path from "path";
import glob from "glob";
import concat from "concat";

import { RawSource } from "webpack-sources";

export const PLUGIN_NAME = "ConcatTextPlugin";

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
	 *
	 * @private
	 * @param {string} globPath The glob path.
	 * @returns {Promise<string[]>} An Array of globbed files.
	 */
	_globTextFiles(globPath) {
		return new Promise((resolve, reject) => {
			glob(globPath, (er, files) => {
				if (er) { reject(er); }

				resolve(files);
			});
		});
	}

	/**
	 * Concatenates all the text files that we could glob into a
	 * single file located at `this.options.target`.
	 *
	 * @param {webpack.Compilation} compilation The Webpack compilation object.
	 * @returns {Promise} Rejected Error.
	 */
	async emitText(compilation) {
		return new Promise(async (resolve, reject) => {
			try {
				const files = await this._globTextFiles(this.options.globPath);
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
		this.options.globPath = path.isAbsolute(this.options.files)
			? this.options.files
			: path.join(compiler.context, this.options.files);

		const filename = path.basename(compiler.options.output.filename, path.extname(compiler.options.output.filename));

		const outputPath = this.options.outputPath || compiler.options.output.path;
		const name = this.options.name || filename + path.extname(this.options.globPath);

		this.options.target = path.isAbsolute(outputPath)
			? path.relative(compiler.options.output.path, path.join(outputPath, name))
			: path.join(outputPath, name);

		compiler.hooks.emit.tapPromise(PLUGIN_NAME, this.emitText.bind(this));
	}

}
