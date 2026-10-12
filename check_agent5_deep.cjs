const fs = require("fs");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_5/solution-patch.patch", "utf8");
if (content.includes("util.deepEqual")) {
  console.log("Agent 5 uses util.deepEqual!");
} else {
  console.log("Agent 5 DOES NOT use util.deepEqual");
}
