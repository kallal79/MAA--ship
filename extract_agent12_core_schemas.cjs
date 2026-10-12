const fs = require("fs");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_12/solution-patch.patch", "utf8");
const schemasIdx = content.indexOf("b/packages/zod/src/v4/core/schemas.ts");
if (schemasIdx !== -1) {
  console.log(content.substring(schemasIdx - 20, schemasIdx + 2000));
}
