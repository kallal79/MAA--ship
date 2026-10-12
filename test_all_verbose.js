const fs = require("fs");
const { execSync } = require("child_process");

function safeGitReset() {
  for (let i = 0; i < 5; i++) {
    try {
      execSync("git reset --hard HEAD", {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
      execSync("git checkout 1fb56a5c", {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
      execSync("git clean -fd", {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
      return;
    } catch (e) {
      if (i === 4) throw e;
      execSync("node -e \"setTimeout(() => {}, 500)\"");
    }
  }
}

console.log("==========================================");
console.log("STARTING VERBOSE LOCAL AGENT EVALUATION");
console.log("Patch: FINAL_TEST_PATCH_V15_GUARANTEED_FAILS.patch");
console.log("==========================================");

for (let i = 1; i <= 11; i++) {
  console.log(\n?? Checking Nova Agent ...);
  safeGitReset();
  
  try {
    execSync(git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_/solution-patch.patch", {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
    console.log(  [x] Applied Agent  Solution);
  } catch (e) {
    console.log(  [!] Failed to apply Agent  solution);
    continue;
  }
  
  try {
    execSync(git apply "C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH_V15_GUARANTEED_FAILS.patch", {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
    console.log(  [x] Applied Test Patch (V15));
  } catch (e) {
    console.log("  [!] Test patch failed to apply!");
    continue;
  }
  
  try {
    console.log("  [?] Running vitest...");
    execSync("pnpm vitest run encode-defaults.8a4f9b.spec.ts encode-defaults-skipEncoding-types.spec.ts", {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
    console.log(  ? RESULT: PASS (All tests passed));
  } catch (e) {
    console.log(  ? RESULT: FAIL (Test assertions failed));
  }
}
console.log("\n==========================================");
console.log("EVALUATION COMPLETE.");
console.log("==========================================");
