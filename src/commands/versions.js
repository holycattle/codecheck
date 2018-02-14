"use strict";

var Promise           = require("bluebird");
var CommandResult     = require("../cli/commandResult");
var ConsoleApp        = require("../app/consoleApp");

var languages = {
  "NodeJS": "node -v",
  "Ruby": "ruby -v",
  "Python": "python --version",
  "Python3": "python3 --version",
  "Java": "java -version",
  "Scala": "scala -version",
  "Groovy": "groovy -v",
  "Go": "go version",
  "PHP": "php -v",
  "Haskell": "ghc --version",
  "Perl": "perl -v",
  "C/C++": "clang --version",
  "C#": "mono --version"
};

var frameworks = {
  "maven": "mvn -v",
  "sbt": "sbt sbtVersion",
  "gradle": "gradle --version",
  "composer": "composer --version",
  "nosestests": "nosetests --version",
  "mocha": "mocha --version",
  "PHPUnit": "phpunit --version",
  "bundler": "bundle --version",
  "cabal": "cabal --version",
  "prove": "prove --version",
  "rspec": "rspec --version"
};

function VersionsCommand() {
}

VersionsCommand.prototype.getCommandRepository = function() {
};

VersionsCommand.prototype.shortHelp = function() {
  return "Show versions";
};

VersionsCommand.prototype.usage = function() {
  console.log("Show versions");
  console.log("  codecheck versions");
  console.log("OPTIONS");
  console.log("  -a, --all: Show frameworks version");
};

VersionsCommand.prototype.run = function(args, options) {
  var self = this;
  return self.process("languages", languages).then(function(result) {
    if (options.all) {
      console.log("\n******** FRAMEWORKS ********");
      return self.process("frameworks", frameworks);
    } else {
      return result;
    }
  });
};

VersionsCommand.prototype.process = function(category, map) {
  return Promise.reduce(Object.keys(map), function(supported, name) {
    var command = map[name];
    var app = new ConsoleApp(command).storeStdout(true).storeStderr(true).ignoreError(true);
    console.log("[" + name + "]");
    return app.run().spread(function(code, stdout, stderr) {
      if (stdout) stdout.forEach(v => console.log(v));
      if (stderr) stderr.forEach(v => console.log(v));
      return code === 0 ? supported + 1 : supported;
    }).catch(function() {
      console.log("Not supported");
      return supported;
    });
  }, 0).then(function(supported) {
    console.log(supported + " " + category + " are supported.");
    return new CommandResult(true);
  });
};

module.exports = VersionsCommand;
