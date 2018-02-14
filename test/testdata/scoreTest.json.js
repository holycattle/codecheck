"use strict";

var DataURI = require("datauri");

var data = {
  "challengeId": 1,
  "resultId": 1,
  "token": "dummy",
  "version": "2.0",
  "envvars": {
    "VAR1": "Taro",
    "var1": "dummy"
  },
  "files": {
    "app/hello.js": "https://raw.githubusercontent.com/shunjikonishi/code-check1/master/app/hello.js",
    "test/test1.js": "https://raw.githubusercontent.com/shunjikonishi/code-check1/master/test/test1.js",
    "challenge.json": "https://raw.githubusercontent.com/shunjikonishi/code-check1/master/challenge.json"
  }  
};

data.files["test/test2.js"] = new DataURI("test/testdata/dataUriTest.js").content;
data.files["data/dataUri.txt"] = new DataURI("test/testdata/dataUri.txt").content;

module.exports = data;
