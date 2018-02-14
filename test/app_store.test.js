"use strict";

var assert = require("chai").assert;
var ConsoleApp = require("../src/app/consoleApp");

describe("ConsoleApp#storeStdout", function() {
  it("should work", function() {
    var app = new ConsoleApp("dummy");
    assert.notOk(app.storeStdout());
    app.storeStdout(true);
    assert.ok(app.storeStdout());
    for (let i=0; i<5; i++) {
      app.emitter.emit("stdout", "a" + (i + 1));
    }
    assert.deepEqual(app.stdoutAsArray(), ["a1", "a2", "a3", "a4", "a5"]);
  });

  it("should not register EventListener twice", function() {
    var app = new ConsoleApp("dummy");
    assert.notOk(app.storeStdout());
    app.storeStdout(true);
    app.storeStdout(true);
    assert.ok(app.storeStdout());
    for (let i=0; i<5; i++) {
      app.emitter.emit("stdout", "b" + (i + 1));
    }
    assert.deepEqual(app.stdoutAsArray(), ["b1", "b2", "b3", "b4", "b5"]);
  });

  it("should work with parameter `false`", function() {
    var app = new ConsoleApp("dummy");
    assert.notOk(app.storeStdout());
    app.storeStdout(true);
    assert.ok(app.storeStdout());
    app.storeStdout(false);
    assert.notOk(app.storeStdout());
    app.storeStdout(true);
    assert.ok(app.storeStdout());
    for (let i=0; i<5; i++) {
      app.emitter.emit("stdout", "c" + (i + 1));
    }
    assert.deepEqual(app.stdoutAsArray(), ["c1", "c2", "c3", "c4", "c5"]);
  });
});

describe("ConsoleApp#storeStderr", function() {
  it("should work", function() {
    var app = new ConsoleApp("dummy");
    assert.notOk(app.storeStderr());
    app.storeStderr(true);
    assert.ok(app.storeStderr());
    for (let i=0; i<5; i++) {
      app.emitter.emit("stderr", "a" + (i + 1));
    }
    assert.deepEqual(app.stderrAsArray(), ["a1", "a2", "a3", "a4", "a5"]);
  });

  it("should not register EventListener twice", function() {
    var app = new ConsoleApp("dummy");
    assert.notOk(app.storeStderr());
    app.storeStderr(true);
    app.storeStderr(true);
    assert.ok(app.storeStderr());
    for (let i=0; i<5; i++) {
      app.emitter.emit("stderr", "b" + (i + 1));
    }
    assert.deepEqual(app.stderrAsArray(), ["b1", "b2", "b3", "b4", "b5"]);
  });

  it("should work with parameter `false`", function() {
    var app = new ConsoleApp("dummy");
    assert.notOk(app.storeStderr());
    app.storeStderr(true);
    assert.ok(app.storeStderr());
    app.storeStderr(false);
    assert.notOk(app.storeStderr());
    app.storeStderr(true);
    assert.ok(app.storeStderr());
    for (let i=0; i<5; i++) {
      app.emitter.emit("stderr", "c" + (i + 1));
    }
    assert.deepEqual(app.stderrAsArray(), ["c1", "c2", "c3", "c4", "c5"]);
  });
});
