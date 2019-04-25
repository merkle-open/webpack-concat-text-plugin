# Concat Text Webpack Plugin

The **ConcatTextPlugin** extracts and concatenates text files from a specified *glob* path into a single file.

## Usage

```js
new ConcatTextPlugin({
    files: "res/**/*.properties",
    name: "values.properties",
    outputPath: "cache/",
})
```

The above configuration will look for `.properties` files under the `res/` folder (relative to the Webpack config file location) and concatenate them into a single file named `values.properties` under the `cache/` directory, which is **relative to the Webpack output path**.

### Options

#### `files` (string)

The *glob* string to get the list of files that should be concatenated.

#### `name` (string, default: same as *Webpack `output.filename`*)

The name of the output file. If it is not specified, the `output.filename` and the `files` glob string file extension will be used as name. If the glob string doesn't have an extension, the name won't have one either:

```js
module.exports = {
    output: {
        path: "dist/",
        filename: "app.js"
    },
    plugins: [
        new ConcatTextPlugin({
            files: "res/**/*",
        })
    ]
}
```

The example above will generate a concatenated file `dist/app` (without a file extension) containing everything under `res/`. The output file won't have a file extension as well if the `files` glob string matches multiple file types:

```js
module.exports = {
    output: {
        path: "dist/",
        filename: "app.js"
    },
    plugins: [
        new ConcatTextPlugin({
            files: "res/**/*.{txt,properties}",
        })
    ]
}
```

Some other examples would be `*.js?(x)` or `*.+(md|markdown)`. Basically, if the file extension is not exact, the output file won't have one.

#### `outputPath` (string, default: same as *Webpack `output.path`*)

Specify where the concatenated file should be placed, relative to the Webpack output path. You might also set it to an **absolute path**.

## Tests

There are some basic snapshot tests to assert the output of the loader.

```
npm test
```
