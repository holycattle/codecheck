"use strict";

var TestRunner = require("./testRunner");

/**
 * nosetests outputs following line on error and failure
 * ======================================================================
 * ERROR: test1.test_primeSeq
 * ======================================================================
 * FAIL: test1.test_prime5
 *
 * nosetests outputs following line at end of test
 * Ran 22 tests in 0.011s
 */
function NoseTestRunner(args, cwd, cmd) {
  function prevIsSep() {
    return prev.indexOf("=====") === 0;
  }
  function onStderr(data) {
    if ((data.indexOf("ERROR:") === 0 || data.indexOf("FAIL:") === 0) && prevIsSep()) {
      self.failureCount++;
      prev = data;
      return;
    }
    var regex = /Ran (\d+) tests? in/;
    var match = data.match(regex);
    if (match) {
      var allCount = parseInt(match[1]);
      self.successCount = allCount - self.failureCount;
    }
    prev = data;
  }

  var self = this;
  var prev = "";
  this.init();
  this.cmd = cmd || "nosetests";
  this.args = args;
  this.cwd = cwd;

  this.onStderr(onStderr);
}

NoseTestRunner.prototype = new TestRunner();

module.exports = NoseTestRunner;
