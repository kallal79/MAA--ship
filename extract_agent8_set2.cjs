const fs = require("fs");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_8/solution-patch.patch", "utf8");
const compareIdx = content.indexOf("function compareMembers");
console.log(content.substring(compareIdx, compareIdx + 1500));
