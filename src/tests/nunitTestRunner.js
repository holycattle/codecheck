"use strict";

var TestRunner = require("./testRunner");
var shellQuote = require("../utils/myQuote");

/**
 * nunit-console outputs following line at end of test
 * Tests run: 22, Failures: 0, Not run: 0, Time: 0.414 seconds
 */
function NUnitTestRunner(args, cwd) {
  function onStdout(data) {
    var regex = /^Tests run: (\d+), Failures: (\d+),/;
    var match = data.match(regex);
    if (match) {
      self.failureCount = parseInt(match[2]);
      self.successCount = parseInt(match[1]) - self.failureCount;
      return;
    }
    regex = /^Tests run: (\d+), Errors: (\d+), Failures: (\d+),/;
    match = data.match(regex);
    if (match) {
      self.failureCount = parseInt(match[2]) + parseInt(match[3]);
      self.successCount = parseInt(match[1]) - self.failureCount;
      return;
    }
  }

  var self = this;
  this.init();
  this.cmd = "nunit-console";
  this.args = args;
  this.cwd = cwd;

  this.onStdout(onStdout);
}

NUnitTestRunner.prototype = new TestRunner();

NUnitTestRunner.prototype.configure = function(yaml) {
  function isMonoCompile(cmd) {
    return cmd.trim().indexOf("mcs ") === 0;
  }
  function addMonoPath(cmd) {
    var ret = shellQuote.parse(cmd);
    var added = false;
    for (var i=0; i<ret.length; i++) {
      if (ret[i].indexOf("-lib:") === 0) {
        ret[i] += "," + monoPath;
        added = true;
        break;
      }
    }
    if (!added) {
      var first = ret.shift();
      ret.unshift("-lib:" + monoPath);
      ret.unshift(first);
    }
    return shellQuote.quote(ret);
  }
  var monoPath = process.env.MONO_PATH;
  if (!monoPath) {
    return;
  }
  var newBuild = [];
  for (var i=0; i<yaml.getBuildCommands().length; i++) {
    var cmd = yaml.getBuildCommands()[i];
    if (isMonoCompile(cmd)) {
      cmd = addMonoPath(cmd);
    }
    newBuild.push(cmd);
  }
  yaml.data.build = newBuild;
};

module.exports = NUnitTestRunner;
