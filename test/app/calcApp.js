"use strict";

var a = parseInt(process.argv[2], 10);
var b = parseInt(process.argv[3], 10);
var op = process.argv[4] || "+";

switch (op) {
  case "+":
    console.log(a + b);
    break;
  case "-":
    console.log(a - b);
    break;
  case "*":
    console.log(a * b);
    break;
  case "/":
    console.log(a / b);
    break;
  case "%":
    console.log(a % b);
    break;
  default:
    console.log("Invalid op: " + op);
}


