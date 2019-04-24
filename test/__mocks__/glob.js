// const glob = jest.requireActual("glob");

const glob = jest.fn();
glob.hasMagic = jest.requireActual("glob").hasMagic;

module.exports = glob;
