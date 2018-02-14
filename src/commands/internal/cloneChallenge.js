"use strict";

var fs            = require("fs");
var mkdirp        = require("mkdirp");
var moment        = require("moment");
var Promise       = require("bluebird");
var CommandResult = require("../../cli/commandResult");
var FileResolver  = require("../../utils/fileResolver");

function CloneChallengeCommand(api) {
  this.api = api;
}

CloneChallengeCommand.prototype.run = function(args) {
  var self = this;
  var id = args[0];

  return new Promise(function(resolve){
    self.cloneChallenge(id, resolve);
  });
};

CloneChallengeCommand.prototype.cloneChallenge = function(resultId, resolve) {
  var self = this;
  var api = this.api;
  api.resultFiles(resultId).then(
    function(response) {
      var username = response.body.result.username; 
      var dirname = username + "-" + resultId;
      mkdirp(dirname, function(err) {
        if (err) {
          resolve(new CommandResult(false, "Can not create directory: " + dirname));
        } else {
          var tasks = [];
          tasks.push(self.doCloneChallenge(dirname, response.body.result.files));
          tasks.push(self.saveSettings(dirname, response.body.result.challengeId, resultId, username));
          Promise.all(tasks).then(function() {
            resolve(new CommandResult(true));
          });
        }
      });
    }, 
    function() {
      resolve(new CommandResult(false, "Fail getChallengeResult: " + resultId));
    }
  );
};

CloneChallengeCommand.prototype.saveSettings = function(dirname, challengeId, resultId, username) {
  var settings = {
    "challengeId": challengeId,
    "resultId": resultId,
    "username": username,
    "lastUpdated": moment().format()
  };
  var data = JSON.stringify(settings, null, "  ");
  return new Promise(function(resolve) {
    var filename = ".codecheck";
    if (dirname) {
      filename = dirname + "/" + filename;
    }
    fs.writeFile(filename, data, resolve);
  });
};

CloneChallengeCommand.prototype.doCloneChallenge = function(dirname, files) {
  return new FileResolver(dirname).generate(files);
};

module.exports = CloneChallengeCommand;
