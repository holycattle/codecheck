"use strict";

var pusage           = require("pidusage");
var psTree           = require("ps-tree");
var exec             = require("child_process").exec;

class CpuWatcher {
  constructor(limit, frequency, interval) {
    this._limit = limit || 0;
    this._frequency = frequency || 5;
    this._interval = interval || 1000;
    this._debug = false;

    this._pid = 0;
    this._children = [];
    this._handle = 0;
  }

  limit(n) {
    if (typeof(n) === "number" && n >= 0) {
      this._limit = n;
      return this;
    } else {
      return this._limit;
    }
  }

  frequency(n) {
    if (typeof(n) === "number" && n > 0) {
      this._frequency = n;
      return this;
    } else {
      return this._frequency;
    }
  }

  interval(n) {
    if (typeof(n) === "number" && n > 0) {
      this._interval = n;
      return this;
    } else {
      return this._interval;
    }
  }

  debug(b) {
    if (typeof(b) === "boolean") {
      this._debug = b;
      return this;
    } else {
      return this._debug;
    }
  }

  watch(process) {
    function processStat(pid, err, stat) {
      if (self._debug) {
        console.log("CPU watch", pid, stat);
      }
      if (stat.cpu > self._limit) {
        if (results[pid]) {
          results[pid] += 1;
        } else {
          results[pid] = 1;
        }
        if (results[pid] >= self._frequency) {
          self.kill(process.pid);
        }
      } else {
        results[pid] = 0;
      }
    }
    function doWatch() {
      pusage.stat(process.pid, (err, stat) => {
        if (err) {
          self.unwatch();
        }
        processStat(process.pid, err, stat);
      });
      psTree(process.pid, (err, children) => {
        children.forEach(child => {
          if (self._children.indexOf(child.PID) === -1) {
            self._children.push(child.PID);
          }
          pusage.stat(child.PID, (err, stat) => {
            processStat(child.PID, err, stat);
          });
        });
      });
    }
    if (!this._limit) {
      return;
    }

    const self = this;
    const results = {};

    this._pid = process.pid;
    this._children = [];
    this._handle = setInterval(doWatch, this._interval);
  }

  unwatch() {
    if (this._pid) {
      clearInterval(this._handle);
      pusage.unmonitor(this._pid);
      this._children.forEach(pid => pusage.unmonitor(pid));

      this._pid = 0;
      this._handle = 0;
      this._children = [];
    }
  }

  kill(pid) {
    psTree(pid, (err, children) => {
      if (!err) {
        const cmd = ['kill', '-9', pid].concat(children.map(p => p.PID)).join(" ");
        exec(cmd, () => {
          console.log("codecheck: Process killed by CPU limit exceeded");
        });
      }
    });
  }
}

module.exports = CpuWatcher;
