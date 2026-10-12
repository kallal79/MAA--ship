const fs = require("fs");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_12/solution-patch.patch", "utf8");
const schemasIdx = content.indexOf("b/packages/zod/src/v4/core/schemas.ts");
const patchText = content.substring(schemasIdx);
const backwardIdx = patchText.indexOf("if (ctx.direction !== \"backward\")");
console.log(patchText.substring(backwardIdx - 200, backwardIdx + 1000));
