"use strict";

var AbstractApp      = require("./abstractApp");
var CommandResult    = require("../cli/commandResult");
var CodecheckResult  = require("../utils/codecheckResult");

function ConsoleApp(cmd, cwd) {
  this.init();
  this.setCommand(cmd);
  this.cwd = cwd;

  this._input = [];
  this._expected = [];
}

ConsoleApp.prototype = new AbstractApp();

ConsoleApp.prototype.input = function() {
  if (arguments.length === 0) {
    return [].concat(this._input);
  }
  this._input = this._input.concat(this.normalizeArgs(arguments));
  return this;
};

ConsoleApp.prototype.expected = function() {
  if (arguments.length === 0) {
    return [].concat(this._expected);
  }
  this._expected = this._expected.concat(this.normalizeArgs(arguments));
  return this;
};

ConsoleApp.prototype.doRun = function(process) {
  process.stdin.setEncoding("utf-8");
  var values = this.input();
  while (values.length) {
    var value = values.shift();
    process.stdin.write(value + "\n");
  }
  process.stdin.end();
};

ConsoleApp.prototype.runAndVerify = function(additionalArgs, done) {
  if (typeof(additionalArgs) === "function") {
    done = additionalArgs;
    additionalArgs = null;
  }
  var errors = [];
  var values = this.expected();
  this.onStdout(function(data) {
    if (values.length === 0) {
      errors.push("Expected vlaue is nothing, but output is " + data);
      return;
    }
    var value = values.shift();
    if (value !== data) {
      errors.push("Expected value is " + value + ", but output is " + data);
    }
  });
  this.onEnd(function(code) {
    while (values.length) {
      var value = values.shift();
      errors.push("Expected value is " + value + ", but no output");
    }
    if (code !== 0) {
      errors.push("Expected exit code is 0, but exit code is " + code);
    }
    var result = new CommandResult(errors.length === 0);
    if (errors.length) {
      result = result.withErrors(errors);
    }
    if (done) {
      done(result);
    }
  });
  this.run(additionalArgs);
};

ConsoleApp.prototype.codecheck = function() {
  return this.run.apply(this, arguments).spread(function(code, stdout, stderr) {
    console.log("" /* to avoid code printed as `xxok ~~~`; code will fail on detecting test cases */);
    return new CodecheckResult(code, stdout, stderr);
  });
};

module.exports = ConsoleApp;