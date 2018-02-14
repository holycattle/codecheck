"use strict";

var AbstractApp      = require("./abstractApp");
var request          = require("request");

function WebApp(port, cmd, cwd) {
  this.init();
  this.port = port;
  this.setCommand(cmd);
  this.cwd = cwd;

  this._testUrl = null;
  this._testPath = "/";
  this._readyCheckInterval = 2000;
}

WebApp.prototype = new AbstractApp();

WebApp.prototype.ready = function(callback) {
  this.on("ready", callback);
};

WebApp.prototype.testUrl = function() {
  if (arguments.length === 0) {
    if (this._testUrl) {
      return this._testUrl;
    }
    var port = this.port === 80 ? "" : ":" + this.port;
    return "http://localhost" + port + this.testPath();
  } else {
    this._testUrl = arguments[0];
    return this;
  }
};

WebApp.prototype.testPath = function() {
  if (arguments.length === 0) {
    return this._testPath;
  } else {
    this._testPath = arguments[0];
    return this;
  }
};

WebApp.prototype.readyCheckInterval = function() {
  if (arguments.length === 0) {
    return this._readyCheckInterval;
  } else {
    this._readyCheckInterval = arguments[0];
    return this;
  }
};

WebApp.prototype.doClose = function(code) {
  if (this._consoleOut) {
    process.stdout.write("codecheck: Finish web app with code " + code + "\n");
  }
};

WebApp.prototype.doRun = function() {
  function checkReady() {
    if (!self.childProcess) {
      return;
    }
    var testUrl = self.testUrl();
    request(testUrl, function(err, response) {
      if (!err && response.statusCode >= 200 && response.statusCode < 300) {
        self.emitter.emit("ready");
      } else {
        setTimeout(checkReady, self._readyCheckInterval);
      }
    });
  }
  var self = this;
  setTimeout(checkReady, this._readyCheckInterval);
};

module.exports = WebApp;