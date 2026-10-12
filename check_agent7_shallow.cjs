const fs = require("fs");
const { execSync } = require("child_process");

execSync("git reset --hard HEAD", {stdio: "ignore"});
execSync("git clean -fd", {stdio: "ignore"});
execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_7/solution-patch.patch"`, {stdio: "ignore"});

const content = fs.readFileSync("packages/zod/src/v4/core/util.ts", "utf8");
const idx = content.indexOf("shallowEqual");
if (idx !== -1) {
  console.log("Agent 7 shallowEqual:");
  console.log(content.substring(idx, idx + 1500));
}
