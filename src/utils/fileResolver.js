"use strict";

var fs            = require("fs");
var mkdirp        = require("mkdirp");
var request       = require("request");
var Promise       = require("bluebird");

function FileResolver(dirname) {
  this.dirname = dirname;
}

FileResolver.prototype.generate = function(files) {
  function getParentDirectory(filename) {
    var array = filename.split("/");
    array.pop();
    return array.join("/");
  }
  var dirname = this.dirname;
  var self = this;
  return new Promise(function(resolve) {
    var tasks = [];
    Object.keys(files).sort().forEach(function(filename) {
      var url = files[filename];
      var fullpath = filename;
      if (dirname) {
        fullpath = dirname + "/" + fullpath;
      }
      tasks.push(new Promise(function(resolve) {
        mkdirp(getParentDirectory(fullpath), function(err) {
          if (err) {
            console.error("Can not create directory: " + getParentDirectory(fullpath));
            resolve(err);
          } else if (url.indexOf("data:") === 0) {
            self.decodeData(fullpath, url, resolve);
          } else {
            self.download(fullpath, url, resolve);
          }
        });
      }));
    });
    Promise.all(tasks).then(resolve);
  });
};

FileResolver.prototype.download = function(filename, url, resolve) {
  var result = null;
  request(url)
    .on('response', function(response) {
      result = {
        status: response.statusCode,
        filename: filename
      };
    })
    .on("end", function() {
      if (result) {
        var prefix = result.status === 200 ? "Success" : "Fail";
        console.log(prefix + " download: " + result.status + ", " + filename);
        resolve(result);
      }
    })
    .on("error", function(err) {
      console.error("Fail download: " + filename + ", " + err);
      resolve(err);
    })
    .pipe(fs.createWriteStream(filename));
};

FileResolver.prototype.decodeData = function(filename, url, resolve) {
  var idx = url.indexOf(",");
  if (idx < 0) {
    console.error("Invalid DataURI: " + filename);
    resolve(null);
    return;
  }
  var data = new Buffer(url.substring(idx + 1), "base64");
  fs.writeFile(filename, data, function(err) {
    if (err) {
      console.error("Fail to write file: " + filename + ", " + err);
    }
    resolve(err);
  });
};

module.exports = FileResolver;
