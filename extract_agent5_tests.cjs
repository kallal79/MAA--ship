const fs = require("fs");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_5/solution-patch.patch", "utf8");
const testIdx = content.indexOf("b/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts");
if (testIdx !== -1) {
  console.log(content.substring(testIdx, testIdx + 2000));
} else {
  console.log("No test changes in Agent 5");
}
