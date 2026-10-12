const fs = require("fs");
const { execSync } = require("child_process");

const results = {};

for (const i of [1, 3, 8, 12]) {
  console.log("Testing Agent " + i);
  execSync("git reset --hard HEAD && git clean -fd", {stdio: "ignore"});
  execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore"});
  
  try {
    execSync(`pnpm vitest run C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts --typecheck.enabled=false`, {stdio: "ignore", timeout: 15000});
    results[i] = "PASS";
  } catch (e) {
    results[i] = "FAIL";
  }
}
console.log(JSON.stringify(results, null, 2));
