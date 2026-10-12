const fs = require("fs");
const cp = require("child_process");

const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_5/solution-patch.patch", "utf8");
const schemasIdx = content.indexOf("b/packages/zod/src/v4/core/schemas.ts");
const patchText = content.substring(schemasIdx);

const defaultParse = patchText.match(/inst\._zod\.parse = \(payload, ctx\) => \{.*?\n    \};/s);
if (defaultParse) {
  console.log("DEFAULT PARSE:\n", defaultParse[0].substring(0, 1000));
}
