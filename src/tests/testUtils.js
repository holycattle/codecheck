"use strict";

var TestRunner      = require("./testRunner");
var MochaTestRunner = require("./mochaTestRunner");
var SbtTestRunner   = require("./sbtTestRunner");
var MavenTestRunner = require("./mavenTestRunner");
var RSpecTestRunner = require("./rspecTestRunner");
var NoseTestRunner  = require("./noseTestRunner");
var CabalTestRunner = require("./cabalTestRunner");
var PhpUnitTestRunner = require("./phpUnitTestRunner");
var GoTestRunner      = require("./goTestRunner");
var ProveTestRunner   = require("./proveTestRunner");
var GradleTestRunner  = require("./gradleTestRunner");
var NUnitTestRunner   = require("./nunitTestRunner");

var frameworks = [
  "mocha",
  "sbt",
  "mvn",
  "maven",
  "rspec",
  "nodestests",
  "cabal",
  "phpunit",
  "go",
  "prove",
  "gradle",
  "nunit-console"
];

function availableFrameworks() {
  return frameworks;
}

function isTestFramework(str) {
  return frameworks.indexOf(str) !== -1;
}

function createTestRunner(name, args, cwd) {
  switch (name) {
    case "mocha":
      return new MochaTestRunner(args, cwd);
    case "sbt":
      return new SbtTestRunner(args, cwd);
    case "maven":
    case "mvn":
      return new MavenTestRunner(args, cwd);
    case "rspec":
      return new RSpecTestRunner(args, cwd);
    case "nosetests":
      return new NoseTestRunner(args, cwd);
    case "python":
    case "python3":
      if (args.length >= 2 && args[0] === "-m" && args[1] === "nose") {
        return new NoseTestRunner(args, cwd, name);
      }
      break;
    case "cabal":
      return new CabalTestRunner(args, cwd);
    case "phpunit":
      return new PhpUnitTestRunner(args, cwd);
    case "go":
      return new GoTestRunner(args, cwd);
    case "prove":
      return new ProveTestRunner(args, cwd);
    case "gradle":
      return new GradleTestRunner(args, cwd);
    case "nunit-console":
      return new NUnitTestRunner(args, cwd);
    default:
  }
  var runner = new TestRunner(name, cwd);
  runner.args = args;
  runner.onStdout(function(data) {
    commonTestCounter(runner, data);
  });
  return runner;
}

function commonTestCounter(runner, data) {
  //Ruby tes-tunit
  //2 tests, 2 assertions, 0 failures, 0 errors, 0 pendings, 0 omissions, 0 notifications
  function rubyTestUnit() {
    var regex = /^(\d+) tests,.*, (\d+) failures,.* (\d+) errors,.*/;
    var match = data.match(regex);
    if (match) {
      runner.failureCount = parseInt(match[2]) + parseInt(match[3]);
      runner.successCount = parseInt(match[1]) - runner.failureCount;
      return true;
    }
    return false;
  }
  function tap() {
    function isOk() {
      return array.length > 0 && array[0] === "ok";
    }
    function isNotOk() {
      return array.length > 1 && array[0] === "not" && array[1] === "ok";
    }
    var ret = true;
    var array = data.split(" ");
    if (isOk()) {
      runner.successCount++;
    } else if (isNotOk()) {
      runner.failureCount++;
    } else {
      ret = false;
    }
    return ret;
  }
  var funcMap = {
    "ruby-test-unit": rubyTestUnit,
    "tap": tap
  };
  if (runner.mode) {
    funcMap[runner.mode]();
    return;
  }
  var keys = Object.keys(funcMap);
  for (var i=0; i<keys.length; i++) {
    var key = keys[i];
    if (funcMap[key]()) {
      runner.mode = key;
      return;
    }
  }
}

module.exports = {
  availableFrameworks: availableFrameworks,
  isTestFramework: isTestFramework,
  createTestRunner: createTestRunner
};