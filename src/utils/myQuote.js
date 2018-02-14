"use strict";

const _          = require("lodash");
const glob       = require("glob");
const shellQuote = require("shell-quote");

class MyQuote {
  constructor(cwd) {
    this._cwd = cwd || '.';
  }

  bind(newCwd) {
    return new MyQuote(newCwd);
  }

  quote(xs) {
    const ret = shellQuote.quote(xs);
    return ret.replace(/\\\*/g, '*');
  }

  parse(str) {
    return _.flatten(shellQuote.parse(str).map(v => {
      if (v.op === "glob" && v.pattern) {
        var expanded = glob.sync(v.pattern, {
          cwd: this._cwd
        });
        return expanded.length > 0 ? expanded : v.pattern;
      } else {
        return v;
      }
    }));
  }
}

module.exports = new MyQuote(process.cwd());
