module.exports = {
	name: "default-output-path.txt",
	files: `${__dirname}/*.txt`,
	outputPath: __dirname.replace("cases", "__output__")
};
