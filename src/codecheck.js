"use strict";

var ReadLine     = require("./utils/readLine");
var MarkdownTest = require("./utils/markdownTest");
var ConsoleApp   = require("./app/consoleApp");

function readline() {
  return new ReadLine();
}
function markdownTest(answers) {
  return new MarkdownTest(answers);
}
function consoleApp(cmd, cwd) {
  var app = new ConsoleApp(cmd, cwd);
  app.consoleOut(true);
  app.storeStdout(true);
  app.storeStderr(true);
  return app;
}

module.exports = {
  readline: readline,
  markdownTest: markdownTest,
  consoleApp: consoleApp
};