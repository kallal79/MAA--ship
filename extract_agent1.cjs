const fs = require("fs");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_1/solution-patch.patch", "utf8");
const match = content.match(/function deepEqual.*?return true;\n\s*\}/s);
if (match) {
  console.log(match[0]);
} else {
  console.log("No deepEqual function found!");
}
