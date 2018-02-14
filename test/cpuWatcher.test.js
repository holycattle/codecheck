"use strict";

var assert = require("chai").assert;
var codecheck = require("../src/codecheck");
var RunCommand = require("../src/commands/run");

describe("CpuWatcher", function() {

  // Basically each test will finish around 5 sec.
  // However, sometimes CPU usage marks less than 90%.
  // In this case, the test will be longer than we expected.
  this.timeout(30000);

  it("node app should be killed around 5sec.", function(done) {
    var app = codecheck.consoleApp("node infinite.js", "test/infinite");
    app.cpuWatcher.limit(90).frequency(5).interval(1000).debug(true);
    app.codecheck().then(() => {
      //Should execute before timeout
      assert(true);
      done();
    });
  });

  it("scala app should be killed around 5sec.", function(done) {
    var app = codecheck.consoleApp("scala infinite.scala", "test/infinite");
    app.cpuWatcher.limit(90).frequency(5).interval(1000).debug(true);
    app.codecheck().then(() => {
      //Should execute before timeout
      assert(true);
      done();
    });
  });

  it("run command should be killed around 5sec.", function(done) {
    var command = new RunCommand();
    command.run(["test/infinite"]).then(() => {
      //Should execute before timeout
      assert(true);
      done();
    });
  });
});

