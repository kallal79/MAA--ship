const fs = require('fs');
const { execSync } = require('child_process');

execSync("git add .", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
execSync("git diff HEAD > C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/3_BRUTAL_TRAPS_TEST_PATCH.patch", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});

const results = {};
for (let i = 1; i <= 10; i++) {
  console.log("Testing Agent " + i);
  
  // Revert any solution changes in src/v4
  execSync("git checkout HEAD -- packages/zod/src/v4/classic/schemas.ts", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
  
  try {
    execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
  } catch (e) {
    results[i] = "FAIL (solution patch apply)"; continue;
  }
  
  try {
    execSync(`pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "pipe", timeout: 15000});
    results[i] = "PASS";
  } catch (e) {
    if (e.code === 'ETIMEDOUT') {
      results[i] = "FAIL (TIMEOUT)";
    } else {
      results[i] = "FAIL";
    }
  }
}
console.log(results);
