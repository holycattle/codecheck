"use strict";

var Promise = require("bluebird");
var request = require("request").defaults({jar: true});

function API(host) {
  this.baseUrl = (host.indexOf("localhost") === 0 ? "http://" : "https://") + host;
}

API.prototype.execute = function(options) {
  return new Promise(function(resolve, reject) {
    request(options, function(err, response) {
      if (err) {
        reject(err);
        return;
      }
      if (response.statusCode >= 200 && response.statusCode < 300 && response.body.code === 200) {
        resolve(response);
      } else {
        reject(response);
      }
    });
  });
};

API.prototype.signin = function(username, password) {
  var options = {
    url: this.baseUrl + "/api/auth/signin",
    method: "POST",
    headers: {
      "X-Requested-With": "codecheck-cli",
    },
    form: {
      nameOrEmail: username,
      password: password
    },
    json: true
  };
  return this.execute(options);
};

API.prototype.resultFiles = function(id) {
  var options = {
    url: this.baseUrl + "/api/cli/results/" + id + "/files",
    method: "GET",
    json: true
  };
  return this.execute(options);
};

API.prototype.examResults = function(id, since) {
  var options = {
    url: this.baseUrl + "/api/cli/exams/" + id + "/results",
    method: "GET",
    json: true,
    qs: {
      since: since || 0
    }
  };
  return this.execute(options);
};

API.prototype.getResultToken = function(resultId) {
  var options = {
    url: this.baseUrl + "/api/results/" + resultId + "/token",
    method: "GET",
    json: true
  };
  return this.execute(options);
};

module.exports = API;
