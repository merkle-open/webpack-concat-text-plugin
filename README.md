# Concat Text Webpack Plugin

The **ConcatTextPlugin** extracts and concatenates text files from a specified *glob* path into a single file.

## Usage

You'll need to specify three options in order to use the plugin.

```js
new ConcatTextPlugin({
    files: "res/**/*.properties",
    name: "values.properties",
    outputPath: "cache/",
})
```

The above configuration will look for `.properties` files under the `res/` folder (relative to the Webpack config file location) and concatenate them into a single file named `values.properties` under the `cache/` directory (also relative to the Webpack config file).

### Options

#### `files` (string)

The *glob* string to get the list of files that should be concatenated.

#### `name` (string)

The name of the output file.

#### `outputPath` (string)

The output path relative to the `webpack.config.js` location.

## Tests

There are some basic snapshot tests to assert the output of the loader.

```
npm test
```
