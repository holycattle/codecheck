"use strict";

var assert       = require("chai").assert;
var ConsoleApp   = require("../src/app/consoleApp");

describe("FizzBuzzApp", function() {

  it("succeed with normal case", function(done) {
    var app = new ConsoleApp("node", ["test/app/fizzbuzzApp.js"]);
    app.input("1", "2", "3", "4", "5");
    app.expected("1", "2", "Fizz", "4", "Buzz");
    app.runAndVerify(function(result) {
      assert.ok(result.succeed);
      done();
    });
  });

  it("fail with wrong expected", function(done) {
    var app = new ConsoleApp("node", ["test/app/fizzbuzzApp.js"]);
    app.consoleOut(true);
    app.input("1", "2", "3", "4", "5");
    app.expected("1", "2", "3", "4", "Buzz");
    app.runAndVerify(function(result) {
      assert.notOk(result.succeed);
      assert.equal(result.errors.length, 1);
      done();
    });
  });

  it("fail with not enough expected", function(done) {
    var app = new ConsoleApp("node", ["test/app/fizzbuzzApp.js"]);
    app.consoleOut(true);
    app.input("1", "2", "3", "4", "5");
    app.expected("1", "2", "Fizz", "4");
    app.runAndVerify(function(result) {
      assert.notOk(result.succeed);
      assert.equal(result.errors.length, 1);
      done();
    });
  });

  it("fail with excess expected", function(done) {
    var app = new ConsoleApp("node", ["test/app/fizzbuzzApp.js"]);
    app.consoleOut(true);
    app.input("1", "2", "3", "4", "5");
    app.expected("1", "2", "Fizz", "4", "Buzz", "Fizz");
    app.runAndVerify(function(result) {
      assert.notOk(result.succeed);
      assert.equal(result.errors.length, 1);
      done();
    });
  });
});
