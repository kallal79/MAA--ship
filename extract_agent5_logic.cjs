const fs = require("fs");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_5/solution-patch.patch", "utf8");
const schemasIdx = content.indexOf("b/packages/zod/src/v4/core/schemas.ts");
const patchText = content.substring(schemasIdx);
const equalFunc = patchText.match(/const finish =.*?matches =.*?result\.omitted = matches/s);
if (equalFunc) {
  console.log(equalFunc[0]);
} else {
  console.log(patchText.substring(patchText.indexOf("const mode = "), patchText.indexOf("const mode = ") + 1500));
}
