const fs = require("fs");
const { execSync } = require("child_process");

const results = {};

function safeGitReset() {
  for (let i = 0; i < 5; i++) {
    try {
      execSync("git reset --hard HEAD", {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
      execSync("git clean -fd", {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
      return;
    } catch (e) {
      if (i === 4) throw e;
      execSync("node -e \"setTimeout(() => {}, 500)\"");
    }
  }
}

for (const i of [4, 8, 9, 12]) {
  console.log("Testing Agent " + i);
  safeGitReset();
  
  try {
    execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
  } catch (e) {
    results[i] = "FAIL (solution patch failed to apply)";
    continue;
  }
  
  try {
    execSync(`git apply "C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/3_BRUTAL_TRAPS_TEST_PATCH.patch"`, {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
    execSync(`node C:/Users/USER/OneDrive/Desktop/MAA/add_class_trap.js`);
  } catch (e) {
    results[i] = "FAIL (test patch failed to apply)";
    continue;
  }
  
  try {
    execSync(`pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false`, {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", timeout: 15000});
    results[i] = "PASS";
  } catch (e) {
    results[i] = "FAIL (TEST FAILED)";
  }
}

let md = "";
for (const i of [4, 8, 9, 12]) {
  md += `Agent ${i}: ${results[i]}\n`;
}

console.log(md);
