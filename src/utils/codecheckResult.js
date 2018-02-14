"use strict";

function CodecheckResult(code, stdout, stderr) {
  this.code = code;
  this.stdout = stdout;
  this.stderr = stderr;
}

CodecheckResult.prototype.stdoutLength = function() {
  return this.stdout.length;
};

CodecheckResult.prototype.stderrLength = function() {
  return this.stderr.length;
};

module.exports = CodecheckResult;