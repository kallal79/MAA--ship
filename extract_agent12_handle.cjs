const fs = require("fs");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_12/solution-patch.patch", "utf8");
const schemasIdx = content.indexOf("b/packages/zod/src/v4/core/schemas.ts");
const patchText = content.substring(schemasIdx);
console.log(patchText.substring(patchText.indexOf("if (ctx.direction !== \"backward\")"), patchText.indexOf("if (ctx.direction !== \"backward\")") + 1000));
