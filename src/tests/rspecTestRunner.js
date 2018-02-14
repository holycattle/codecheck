"use strict";

var TestRunner = require("./testRunner");

/**
 * rspec outputs following line at end of test
 * 22 examples, 0 failures
 */
function RSpecTestRunner(args, cwd) {
  function onStdout(data) {
    var regex = /(\d+) examples?, (\d+) failures?/;
    var match = data.match(regex);
    if (match) {
      self.failureCount = parseInt(match[2]);
      self.successCount = parseInt(match[1]) - self.failureCount;
    }
  }

  var self = this;
  this.init();
  this.cmd = "rspec";
  this.args = args;
  this.cwd = cwd;

  this.onStdout(onStdout);
}

RSpecTestRunner.prototype = new TestRunner();

module.exports = RSpecTestRunner;
