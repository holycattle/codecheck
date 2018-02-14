"use strict";

var assert = require("chai").assert;
var rimraf = require("rimraf");
var ScoreCommand = require("../src/commands/score");

describe("Score command", function() {
  this.timeout(5000);

  before(function(done) {
    rimraf("codecheck", done);
  });

  after(function(done) {
    rimraf("codecheck", done);
  });

  it("should succeed", function(done) {
    var json = require("./testdata/scoreTest.json.js");
    var command = new ScoreCommand(null);
    command.run([JSON.stringify(json)]).then(function(result) {
      assert.equal(result.succeed, true);
      assert.equal(result.exitCode, 0);
    }).then(done, done);
  });
});

