"use strict";

var ReadLine     = require("./utils/readLine");
var MarkdownTest = require("./utils/markDownTest");

function readline() {
  return new ReadLine();
}
function markdownTest(answers) {
  return new MarkdownTest(answers);
}

module.exports = {
  readline: readline,
  markdownTest: markdownTest
};