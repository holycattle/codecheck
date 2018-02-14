"use strict";

var assert = require("chai").assert;
var ConsoleApp = require("../src/app/consoleApp");

describe("ConsoleApp#storeStdout", function() {
  this.timeout(10000);

  it("can handle very large outputs", function() {
    var MAX = 10000;
    var LOOP = 1000000;

    var start = new Date().getTime();
    var app = new ConsoleApp("dummy");
    app.storeStdMax(MAX);
    assert.notOk(app.storeStdout());
    app.storeStdout(true);
    assert.ok(app.storeStdout());
    for (let i=0; i<LOOP; i++) {
      app.emitter.emit("stdout", "a" + (i + 1));
    }
    console.log("time = " + (new Date().getTime() - start) + "ms");
    var ret = app.stdoutAsArray();
    assert.equal(ret.length, MAX);
    for (let i=0; i<ret.length; i++) {
      assert.equal(ret[i], "a" + (i + 1 + LOOP - MAX));
    }
  });

});

