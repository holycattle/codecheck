"use strict";

var config = require("./config.json");
var app    = require(config.code_main_dir + "/specs/utils/AppUtils");
var db     = require(app.fromSpecRoot("/utils/DBUtils"));
var assert = require("chai").assert;
var rimraf = require("rimraf");
var moment = require("moment");
var fs     = require("fs");

var API          = require("../src/api");
var PullCommand  = require("../src/commands/pull");

var baseDir = process.cwd();

describe("Pull challenge", function() {
  this.timeout(5000);

  var api = new API(config.host);
  var resultId, challengeId;
  var dirname = "temp-challenge"; 

  before(function(done) {
    initData(function(data) {
      challengeId = data.challenges[0].id;
      resultId = data.challenge_results[0].id;

      fs.mkdirSync(dirname);
      fs.writeFileSync(dirname + "/.codecheck", JSON.stringify({
        resultId: resultId
      }));
      process.chdir(dirname);
      done();
    });
  });

  after(function(done) {
    process.chdir(baseDir);
    rimraf(dirname, done);
  });

  it("should be exception with args", function(done) {
    var command = new PullCommand(api);
    try {
      command.run([1], {});
      assert.fail();
    } catch(e) {
      done();
    }
  });
  it("should fail with invalid password", function(done) {
    var command = new PullCommand(api);
    command.run([], {
      user: "shunjikonishi",
      password: "---"
    }).then(function(result) {
      assert.equal(result.succeed, false);
      done();
    });
  });
  it("should succeed", function(done) {
    var command = new PullCommand(api);
    command.run([], {
      user: "shunjikonishi",
      password: "password"
    }).then(function(result) {
      assert.equal(result.succeed, true);
      assert.ok(fs.existsSync("README.md"));
      assert.ok(fs.existsSync("test/test3.js"));

      var settings = JSON.parse(fs.readFileSync(".codecheck"));
      assert.equal(settings.challengeId, challengeId);
      assert.equal(settings.resultId, resultId);
      assert.equal(settings.username, "shunjikonishi");
      done();
    });
  });
});

describe("Pull exam", function() {
  this.timeout(5000);

  var api = new API(config.host);
  var examId, resultId;
  var dirname = "temp-exam"; 

  before(function(done) {
    initData(function(data) {
      examId = data.exams[0].id;
      resultId = data.challenge_results[0].id;

      fs.mkdirSync(dirname);
      fs.writeFileSync(dirname + "/.codecheck", JSON.stringify({
        examId: examId,
        lastUpdated: moment(0).format()
      }));
      process.chdir(dirname);
      done();
    });
  });

  after(function(done) {
    process.chdir(baseDir);
    rimraf(dirname, done);
  });

  it("should succeed", function(done) {
    var command = new PullCommand(api);
    command.run([], {
      user: "shunjikonishi",
      password: "password"
    }).then(function(result) {
      assert.equal(result.succeed, true);
      var resultPath = "shunjikonishi/challenge1-" + resultId + "/";
      assert.ok(fs.existsSync(resultPath + "README.md"));
      assert.ok(fs.existsSync(resultPath + "test/test3.js"));

      var settings = JSON.parse(fs.readFileSync(".codecheck"));
      assert.ok(settings.examId, examId);
      done();
    });
  });
});

function initData(done) {
  db.deleteAll().then(function() {
    db.create(require(app.fromSpecRoot("/fixtures/challengeViewer.json"))).then(function(data) {
      done(data);
    });
  });
}
