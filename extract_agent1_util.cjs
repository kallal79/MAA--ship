const fs = require("fs");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_1/solution-patch.patch", "utf8");
const utilIdx = content.indexOf("b/packages/zod/src/v4/core/util.ts");
if (utilIdx !== -1) {
  console.log(content.substring(utilIdx - 20, utilIdx + 1500));
}
