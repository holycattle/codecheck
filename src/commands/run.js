"use strict";

var Promise       = require("bluebird");
var stripBom      = require("strip-bom");
var CommandResult = require("../cli/commandResult");
var fs            = require("fs");
var TestUtils     = require("../tests/testUtils");
var ConsoleApp    = require("../app/consoleApp");
var CodecheckYaml = require("../codecheckYaml");
var shellQuote    = require("../utils/myQuote");

function RunCommand() {
}

RunCommand.prototype.shortHelp = function() {
  return "Run test";
};

RunCommand.prototype.usage = function() {
  console.log("Usage: run");
  console.log("  codecheck run [TestFramework] [Directory] [Options]*");
  console.log("Arguments:");
  console.log("  TestFramework: Option. The name of test framework.");
  console.log("                 Available frameworks: " + TestUtils.availableFrameworks().join(", "));
  console.log("                 If omiited, the value of test in challenge.json");
  console.log("  Directory    : Option. Base directory to run test.");
  console.log("  Options      : The arguments pass to TestFramework.");
};

RunCommand.prototype.run = function(args) {
  var self = this;
  return new Promise(function(resolve) {
    self.prepare(args, resolve);
  });
};

RunCommand.prototype.withEnv = function(env) {
  this.env = env;
  return this;
};

RunCommand.prototype.checkEnvvars = function(envvars, config) {
  var self = this;
  Object.keys(envvars).forEach(function(key) {
    if (!envvars[key]) {
      return;
    }
    if (self.env && self.env[key]) {
      return;
    }
    if (config.getEnvironment() && config.getEnvironment()[key]) {
      return;
    }
    if (process.env && process.env[key]) {
      return;
    }
    console.log("codecheck warning: envvar is not defnied - " + key);
  });
};

RunCommand.prototype.prepare = function(args, resolve) {
  var name = null;
  if (args.length > 0 && TestUtils.isTestFramework(args[0])) {
    name = args.shift();
  }
  var dir = null;
  if (args.length > 0) {
    try {
      var stat = fs.statSync(args[0]);
      if (stat && stat.isDirectory()) {
        dir = args.shift();
      }
    } catch (e) {
      //Do nothing
    }
  }
  var config = this.getConfig(dir);
  var filename = "challenge.json";
  if (dir) {
    filename = dir + "/" + filename;
  }
  try {
    var settings = JSON.parse(stripBom(fs.readFileSync(filename, "utf-8")));
    if (settings && settings.test && !name) {
      var testArgs = shellQuote.parse(settings.test);
      name = testArgs.shift();
      if (testArgs.length) {
        args = testArgs.concat(args);
      }
    }
    if (settings && settings.envvars) {
      this.checkEnvvars(settings.envvars, config);
    }
  } catch (e) {
    //Do nothing
  }
  if (!name) {
    name = config.getTestCommand();
    if (name) {
      var configArgs = shellQuote.parse(name);
      name = configArgs.shift();
      args = configArgs.concat(args);
    }
  }
  if (!name && args.length > 0) {
    name = args.shift();
  }
  if (!name) {
    resolve(new CommandResult(false, "Could not decide test framework"));
    return;
  }
  this.doRun(name, args, dir, config, resolve);
};

RunCommand.prototype.getConfig = function(dir) {
  var config = new CodecheckYaml();
  var codecheckYml = "codecheck.yml";
  var packageJson = "package.json";
  if (dir) {
    codecheckYml = dir + "/" + codecheckYml;
    packageJson = dir + "/" + packageJson;
  }
  if (fs.existsSync(codecheckYml)) {
    config.load(codecheckYml);
  }
  if (fs.existsSync(packageJson) && !config.hasBuildCommand("npm")) {
    config.addBuildCommand("npm install", config.getBuildCommands()[0]);
  }
  return config;
};

RunCommand.prototype.doBuild = function(config, dir, callback) {
  function build() {
    var next = commands.shift();
    if (next) {
      next = shellQuote.quote(shellQuote.bind(dir).parse(next));
      var start = new Date().getTime();
      console.log("Start build: " + next);
      var app = new ConsoleApp(next, dir);
      app.consoleOut(true);
      app.setEnvironment(config.getEnvironment());
      if (self.env) {
        app.setEnvironment(self.env);
      }
      app.onEnd(function(code) {
        if (code !== 0) {
          callback(new CommandResult(false, "Fail build: " + next).withExitCode(code));
        } else {
          console.log("Finish build: " + next + " (" + (new Date().getTime() - start) + "ms)");
          build();
        }
      });
      app.run();
    } else {
      callback();
    }
  }
  var self = this;
  var commands = config.getBuildCommands();
  build();
};

RunCommand.prototype.doWebApp = function(webapp, callback) {
  var start = new Date().getTime();
  console.log("Start webapp: " + webapp.getCommandLine());
  webapp.ready(function() {
    console.log("Ready webapp: " + webapp.getCommandLine() + " (" + (new Date().getTime() - start) + "ms)");
    callback();
  });
  webapp.run();
};

RunCommand.prototype.doRun = function(name, args, dir, config, resolve) {
  function afterWebApp(result) {
    if (result) {
      resolve(result);
    } else {
      runner.setEnvironment(config.getEnvironment());
      if (self.env) {
        runner.setEnvironment(self.env);
      }
      runner.consoleOut(true);
      runner.onEnd(function(code) {
        if (webapp) {
          webapp.kill(function() {
            resolve(new CommandResult(true).withExitCode(code));
          });
        } else {
          resolve(new CommandResult(true).withExitCode(code));
        }
      });
      runner.run();
    }
  }
  function afterBuild(result) {
    if (result) {
      resolve(result);
    } else {
      if (config.hasWebApp()) {
        webapp = config.createWebApp(dir);
        if (self.env) {
          webapp.setEnvironment(self.env);
        }
        webapp.consoleOut(true);
        self.doWebApp(webapp, afterWebApp);
      } else {
        afterWebApp();
      }
    }
  }
  var self = this;
  var webapp = null;
  var runner = TestUtils.createTestRunner(name, args, dir);
  var cpuSetting = config.getCpuSetting();
  if (cpuSetting) {
    runner.cpuWatcher.limit(cpuSetting.limit);
    runner.cpuWatcher.frequency(cpuSetting.frequency);
    runner.cpuWatcher.interval(cpuSetting.interval);
    runner.cpuWatcher.debug(cpuSetting.debug);
  }
  if (config.getAppCommand()) {
    console.log("codecheck: appCommand: " + config.getAppCommand());
  }
  console.log("codecheck: testCommand: " + runner.getCommandLine());
  runner.configure(config);
  setTimeout(function() {
    resolve(new CommandResult(false, "Timeout").withExitCode(1));
  }, config.getTimeout() * 1000);
  this.doBuild(config, dir, afterBuild);
};

module.exports = RunCommand;
