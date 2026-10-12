const fs = require("fs");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_5/solution-patch.patch", "utf8");
const idx = content.indexOf("function compareMembers");
console.log(content.substring(idx, idx + 2000));
