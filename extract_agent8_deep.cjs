const fs = require("fs");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_8/solution-patch.patch", "utf8");
const match = content.match(/deepEqual[\s\S]*?(?=\n\+})?/);
if (match) console.log(match[0].substring(0, 1500));
