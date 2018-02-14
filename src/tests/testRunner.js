"use strict";

var AbstractApp  = require("../app/abstractApp");

function TestRunner(cmd, cwd) {
  this.init();
  this.setCommand(cmd);
  this.cwd = cwd;

  this.successCount = 0;
  this.failureCount = 0;
}

TestRunner.prototype = new AbstractApp();

TestRunner.prototype.getSuccessCount = function() {
  return this.successCount;
};

TestRunner.prototype.getFailureCount = function() {
  return this.failureCount;
};

TestRunner.prototype.getExecuteCount = function() {
  return this.successCount + this.failureCount;
};

TestRunner.prototype.doClose = function(code) {
  if (this._consoleOut) {
    process.stdout.write("\ncodecheck: Finish with code " + code + "\n");
    process.stdout.write("codecheck: tests  : " + this.getExecuteCount() + "\n");
    process.stdout.write("codecheck: success: " + this.getSuccessCount() + "\n");
    process.stdout.write("codecheck: failure: " + this.getFailureCount() + "\n");
  }
};

/*eslint no-unused-vars: 0*/
TestRunner.prototype.configure = function(yaml) {
  //Will be overrided by subclass
};


module.exports = TestRunner;