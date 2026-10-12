const fs = require("fs");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_5/solution-patch.patch", "utf8");
const patchText = content.substring(content.indexOf("function compareMembers"));
console.log(patchText.substring(0, 2500));
