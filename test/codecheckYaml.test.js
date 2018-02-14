"use strict";

var assert        = require("chai").assert;
var CodecheckYaml = require("../src/codecheckYaml");

describe("CodecheckYaml", function() {
  it("can load and can access its data", function() {
    var config = new CodecheckYaml();
    assert.ok(config.load("test/testdata/code-main.yml"));

    assert.ok(config.hasWebApp());
    assert.ok(config.getWebAppCommand().indexOf("sbt run") === 0);
    assert.equal(config.getWebAppPort(), 9000);
    assert.ok(config.getWebAppConsole());

    assert.ok(config.getBuildCommands().length, 1);
    assert.ok(config.getBuildCommands()[0].indexOf("npm install") === 0);

    assert.ok(config.getTestCommands().length, 1);
    assert.ok(config.getTestCommands()[0].indexOf("mocha") === 0);

  });

  it("hasBuildCommand", function() {
    var config = new CodecheckYaml();
    assert.ok(config.load("test/testdata/buildtest.yml"));

    assert.ok(config.hasBuildCommand("npm"), "match with partial command");
    assert.ok(config.hasBuildCommand("npm install"), "match with partial command(2)");
    assert.ok(config.hasBuildCommand("npm  install  --production"), "allow multiple space");
    assert.notOk(config.hasBuildCommand("npm install --hoge"), "not match");

    assert.notOk(config.hasBuildCommand("npm", true), "not match with partial command when strict mode");
    assert.notOk(config.hasBuildCommand("npm install", true), "not match with partial command when strict mode(2)");
    assert.ok(config.hasBuildCommand("npm  install  --production", true), "allow multiple space when strict mode");
    assert.notOk(config.hasBuildCommand("npm install --hoge", true), "not match when strict mode");
  });

});

describe("addBuildCommand", function() {

  it("add to last", function() {
    var config = new CodecheckYaml();
    assert.ok(config.load("test/testdata/buildtest.yml"));

    config.addBuildCommand("hogehoge");
    var commands = config.getBuildCommands();
    assert.equal(commands.length, 4);
    assert.equal(commands.indexOf("hogehoge"), 3);
  });

  it("add to head", function() {
    var config = new CodecheckYaml();
    assert.ok(config.load("test/testdata/buildtest.yml"));

    config.addBuildCommand("hogehoge", config.getBuildCommands()[0]);
    var commands = config.getBuildCommands();
    assert.equal(commands.length, 4);
    assert.equal(commands.indexOf("hogehoge"), 0);
  });

  it("add to middle", function() {
    var config = new CodecheckYaml();
    assert.ok(config.load("test/testdata/buildtest.yml"));

    config.addBuildCommand("hogehoge", config.getBuildCommands()[1]);
    var commands = config.getBuildCommands();
    assert.equal(commands.length, 4);
    assert.equal(commands.indexOf("hogehoge"), 1);
  });

  it("insert before undefined is equal to add to last", function() {
    var config = new CodecheckYaml();
    assert.ok(config.load("test/testdata/buildtest.yml"));

    config.addBuildCommand("hogehoge", undefined);
    var commands = config.getBuildCommands();
    assert.equal(commands.length, 4);
    assert.equal(commands.indexOf("hogehoge"), 3);
  });
});