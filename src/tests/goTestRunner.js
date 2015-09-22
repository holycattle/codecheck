"use strict";

var path       = require("path");
var TestRunner = require("./testRunner");

function GoTestRunner(args, cwd) {
  function initArgs() {
    var ret = args || [];
    if (args.indexOf("-v") === -1) {
      args.push("-v");
    }
    return ret;
  }
  function onStdout(data) {
    function isOk() {
      return data.indexOf("--- PASS:") === 0;
    }
    function isNotOk() {
      return data.indexOf("--- FAIL:") === 0;
    }
    if (isOk()) {
      self.successCount++;
    } else if (isNotOk()) {
      self.failureCount++;
    }
  }

  var self = this;
  this.init();
  this.cmd = "go";
  this.args = initArgs();
  this.cwd = cwd;

  var gopath = process.cwd();
  if (process.env.GOPATH) {
    gopath = process.env.GOPATH + path.delimiter + gopath;
  }
  if (cwd) {
    gopath = path.from(gopath, cwd);
  }
  this.env = {
    "GOPATH": gopath
  };

  this.onStdout(onStdout);
}

GoTestRunner.prototype = new TestRunner();

module.exports = GoTestRunner;