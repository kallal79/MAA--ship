const fs = require("fs");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_1/solution-patch.patch", "utf8");
const files = content.match(/^diff --git a\/.*? b\/(.*?)$/gm);
console.log(files);
