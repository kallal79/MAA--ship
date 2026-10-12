const fs = require("fs");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_8/solution-patch.patch", "utf8");
const schemasIdx = content.indexOf("b/packages/zod/src/v4/core/schemas.ts");
const patchText = content.substring(schemasIdx);
const compareIdx = patchText.indexOf("if (a instanceof Set || b instanceof Set)");
console.log(patchText.substring(compareIdx, compareIdx + 500));
