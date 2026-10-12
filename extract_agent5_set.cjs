const fs = require("fs");
const cp = require("child_process");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_5/solution-patch.patch", "utf8");
const compareIdx = content.indexOf("if (a instanceof Set || b instanceof Set)");
console.log(content.substring(compareIdx, compareIdx + 1500));
