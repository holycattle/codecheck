"use strict";

var assert = require("chai").assert;
var fs     = require("fs");

//Used in scoreTest.json
describe("DataURI test", function() {
  it("verify testfile", function() {
    var data = fs.readFileSync("data/dataUri.txt", "utf-8");
    assert.equal(data, "This text is encoded to DataURI!");
  });
});