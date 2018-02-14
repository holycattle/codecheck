"use strict";

var Promise       = require("bluebird");
var mkdirp        = require("mkdirp");
var CommandResult = require("../cli/commandResult");

var RunCommand               = require("./run");
var FileResolver             = require("../utils/fileResolver");

function ScoreCommand(api) {
  this.api = api;
}

ScoreCommand.prototype.shortHelp = function() {
  return "Mark score to challenge. Internal use only.";
};

ScoreCommand.prototype.usage = function() {
  console.log("Usage: score");
  console.log("  codecheck score <JSON>");
};

ScoreCommand.prototype.internalOnly = true;

ScoreCommand.prototype.checkArgs = function(args) {
  var json = null;
  if (args.length === 1) {
    var str = args[0];
    if (str.charAt(0) !== "{") {
      str = new Buffer(str, "base64").toString();
    }
    json = JSON.parse(str);
  }
  if (!json) {
    throw "score command takes json argument.";
  }
  return json;
};

ScoreCommand.prototype.run = function(args) {
  var self = this;
  var json = this.checkArgs(args);

  return new Promise(function(resolve){
    var dirname = "codecheck";
    mkdirp(dirname, function(err) {
      if (err) {
        resolve(new CommandResult(false, "Can not create directory: " + dirname));
      } else {
        self.doScore(dirname, json, resolve);
      }
    });
  });
};

ScoreCommand.prototype.doScore = function(dirname, json, resolve) {
  new FileResolver(dirname).generate(json.files).then(function() {
    new RunCommand().withEnv(json.envvars).run([dirname]).then(function(result) {
      resolve(result);
    });
  });
};

module.exports = ScoreCommand;
