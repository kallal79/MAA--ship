const fs = require("fs");
const { execSync } = require("child_process");

// The file just got cleaned. Let me re-apply Agent 5 and check shallowEqual
execSync("git reset --hard HEAD", {stdio: "ignore"});
execSync("git clean -fd", {stdio: "ignore"});
execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_5/solution-patch.patch"`, {stdio: "ignore"});

const content = fs.readFileSync("packages/zod/src/v4/core/util.ts", "utf8");
const idx = content.indexOf("export function shallowEqual");
if (idx !== -1) {
  console.log("Agent 5 shallowEqual:");
  console.log(content.substring(idx, idx + 1500));
} else {
  console.log("shallowEqual not found. Searching for 'shallow'...");
  const idx2 = content.indexOf("shallow");
  console.log("First 'shallow' at:", idx2);
  if (idx2 !== -1) console.log(content.substring(idx2, idx2 + 500));
}
