const fs = require("fs");
const { execSync } = require("child_process");

const results = {};

for (let i = 1; i <= 12; i++) {
  console.log("Testing Agent " + i);
  execSync("git reset --hard HEAD", {stdio: "ignore"});
  execSync("git clean -e FINAL_TEST_PATCH_TO_UPLOAD.patch -e FINAL_SOLUTION_TO_UPLOAD.patch -fd", {stdio: "ignore"});
  
  try {
    execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore"});
  } catch (e) {
    results[i] = "FAIL (solution patch failed to apply)";
    continue;
  }
  
  try {
    execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/zod/FINAL_TEST_PATCH_TO_UPLOAD.patch"`, {stdio: "ignore"});
  } catch (e) {
    results[i] = "FAIL (test patch failed to apply)";
    continue;
  }
  
  try {
    execSync(`pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false`, {stdio: "ignore"});
    results[i] = "PASS";
  } catch (e) {
    results[i] = "FAIL";
  }
}
console.log("\nFINAL RESULTS:");
console.log(JSON.stringify(results, null, 2));

execSync("git reset --hard HEAD");
execSync("git clean -e FINAL_TEST_PATCH_TO_UPLOAD.patch -e FINAL_SOLUTION_TO_UPLOAD.patch -fd");
