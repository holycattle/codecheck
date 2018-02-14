"use strict";

var Promise       = require("bluebird");
var io            = require("socket.io-client");
var CommandResult = require("../cli/commandResult");
var SigninCommand = require("./internal/signin");

var WHALE_URL = process.env.WHALE_URL || "https://test.code-check.io";

function TestResultCommand(api) {
  this.api = api;
}

TestResultCommand.prototype.shortHelp = function() {
  return "Run challenge on codecheck test server.";
};

TestResultCommand.prototype.usage = function() {
  console.log("Usage: test-result");
  console.log("  codecheck test-result <ResultId>");
  console.log("Arguments:");
  console.log("  ResultId: Challenge result id to run test.");
  console.log("Options:");
  console.log("  -u, --user    : username");
  console.log("  -p, --password: password");
};

TestResultCommand.prototype.checkArgs = function(args) {
  if (args.length === 0) {
    throw "ResultId is required";
  } else if (args.length > 1) {
    throw "Too many args" + JSON.stringify(args);
  }
};


TestResultCommand.prototype.run = function(args, options) {
  function doRun() {
    var d1= self.api.getResultToken(resultId);
    var d2 = self.api.resultFiles(resultId);

    return Promise.all([d1, d2]).then((results) => {
      var token = results[0].body.result;
      var files = results[1].body.result.files; 
      return new Promise((resolve) => {
        console.log();
        console.log("Connect to codecheck test server...");
        self.runTest(resultId, token, options.ignoreVars ? null : token, files, resolve);
      });
    },
    () => {
      return withSignin();
    });
  }
  function withSignin() {
    return new SigninCommand(self.api).run(null, options).then(
      () => {
        return doRun();
      }, 
      () => {
        return new CommandResult(false, "Fail signin");
      }
    );
  }
  this.checkArgs(args);

  var self = this;
  var resultId = args[0];
  if (options.user) {
    return withSignin();
  } else {
    return doRun();
  }
};

TestResultCommand.prototype.runTest = function(resultId, token, varToken, files, resolve) {
  function ignoreLine(line) {
    if (!line) {
      return false;
    }
    if (ignoreLines) {
      ignoreLines--;
      return true;
    }
    // Warning message on `bundle install`
    if (line.indexOf("Don't run Bundler as root.") === 0) {
      ignoreLines = 2;
      return true;
    }
    return false;
  }
  var ignoreLines = 0;
  var socket = io(WHALE_URL, {
    forceNew: true,
    transports: ["websocket"]
  });
  socket.on("line", (data) => {
    if (ignoreLine(data)) {
      return;
    }
    console.log(data);
  });
  socket.on("disconnect", () => {
    resolve(new CommandResult(true));
  });

  var msg = {
    version: 2.0,
    name: "codecheck CLI - " + resultId,
    resultId: resultId,
    token: token,
    files: files
  };
  if (varToken) {
    msg.varToken = varToken;
    msg.server = this.api.baseUrl;
  }
  socket.emit("runTest", msg);
};

module.exports = TestResultCommand;
