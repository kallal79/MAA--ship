const fs = require("fs");
const cp = require("child_process");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_12/solution-patch.patch", "utf8");
const match = content.match(/function deepEqual.*?return true;\s*\}/s);
if (match) console.log("Agent 12 deepEqual:", match[0].substring(0, 500));
else {
  const match2 = content.match(/function shallowEqual.*?return true;\s*\}/s);
  if (match2) console.log("Agent 12 shallowEqual:", match2[0].substring(0, 500));
  else console.log("No deepEqual or shallowEqual found");
}
