"use strict";

var yaml   = require('js-yaml');
var fs     = require('fs');
var WebApp = require("./app/webApp");

var DEFAULT_TIMEOUT = 60 * 10;

function CodecheckYaml(data) {
  this.data = data || {};
}

CodecheckYaml.prototype.load = function(filename) {
  try {
    this.data = yaml.safeLoad(fs.readFileSync(filename, 'utf-8')) || {};
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

CodecheckYaml.prototype.hasWebApp = function() {
  if (this.data && this.data.web) {
    var web = this.data.web;
    return web.command && web.port;
  }
  return false;
};

CodecheckYaml.prototype.getWebAppCommand = function() {
  return this.hasWebApp() ? this.data.web.command : null;
};

CodecheckYaml.prototype.getWebAppPort = function() {
  return this.hasWebApp() ? this.data.web.port : null;
};

CodecheckYaml.prototype.getWebAppConsole = function() {
  return this.hasWebApp() ? this.data.web.console || false : false;
};

CodecheckYaml.prototype.getWebAppDirectory = function() {
  return this.hasWebApp() ? this.data.web.dir || null : null;
};

CodecheckYaml.prototype.getWebAppTestUrl = function() {
  return this.hasWebApp() ? this.data.web.testUrl || null : null;
};

CodecheckYaml.prototype.getWebAppTestPath = function() {
  return this.hasWebApp() ? this.data.web.testPath || '/' : '/';
};

CodecheckYaml.prototype.createWebApp = function(baseDir) {
  var cmd = this.getWebAppCommand();
  var port = this.getWebAppPort();
  var consoleOut = this.getWebAppConsole();
  var testUrl = this.getWebAppTestUrl();
  var testPath = this.getWebAppTestPath();
  var env = this.getEnvironment();
  var dir = this.getWebAppDirectory();
  if (baseDir) {
    dir = dir ? baseDir + "/" + dir : baseDir;
  }
  var app = new WebApp(port, cmd, dir);
  app.setEnvironment(env);
  app.consoleOut(consoleOut);
  app.testUrl(testUrl);
  app.testPath(testPath);
  return app;
};

CodecheckYaml.prototype.getAsArray = function(key) {
  if (this.data && this.data[key]) {
    var value = this.data[key];
    return Array.isArray(value) ? value : [value];
  }
  return [];
};

CodecheckYaml.prototype.getBuildCommands = function() {
  return this.getAsArray("build");
};

CodecheckYaml.prototype.hasBuildCommand = function(str, strict) {
  function splitCommand(cmd) {
    return cmd.match(/"[^"]*"|[^ ]+/g) || [];
  }
  var cmdArray = splitCommand(str);
  return this.getBuildCommands().some(function(v) {
    var cmdArray2 = splitCommand(v);
    if (strict && cmdArray.length !== cmdArray2.length) {
      return false;
    }
    for (var i=0; i<cmdArray.length; i++) {
      if (cmdArray[i] !== cmdArray2[i]) {
        return false;
      }
    }
    return true;
  });
};

CodecheckYaml.prototype.addBuildCommand = function(str, insertBefore) {
  if (!this.data.build) {
    this.data.build = [];
  }
  var value = this.data.build;
  if (!Array.isArray(value)) {
    value = [value];
    this.data.build = value;
  }
  if (insertBefore && value.indexOf(insertBefore) !== -1) {
    value.splice(value.indexOf(insertBefore), 0, str);
  } else {
    value.push(str);
  }
};

CodecheckYaml.prototype.getTestCommands = function() {
  return this.getAsArray("test");
};

CodecheckYaml.prototype.getTestCommand = function() {
  var array = this.getAsArray("test");
  return array && array.length ? array[0] : null;
};

CodecheckYaml.prototype.getTimeout = function() {
  var ret = DEFAULT_TIMEOUT;
  if (this.data && this.data.config && this.data.config.timeout) {
    ret = this.data.config.timeout;
  }
  return ret;
};

CodecheckYaml.prototype.getEnvironment = function() {
  return this.data ? this.data.env || this.data.environment : null;
};

CodecheckYaml.prototype.getAppCommand = function() {
  var env = this.getEnvironment();
  return env ? env.APP_COMMAND : null;
};

CodecheckYaml.prototype.getCpuSetting = function() {
  if (!this.data || !this.data.cpu || !this.data.cpu.limit) {
    return null;
  }
  var ret = this.data.cpu;
  if (!ret.frequency) {
    ret.frequency = 5;
  }
  if (!ret.interval) {
    ret.interval = 1000;
  }
  ret.debug = ret.debug || false;
  return ret;
};

module.exports = CodecheckYaml;
