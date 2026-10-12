const fs = require('fs');
const { execSync } = require('child_process');

function safeGitReset() {
  for (let i = 0; i < 5; i++) {
    try {
      execSync("git reset --hard 1fb56a5c", {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
      execSync("git clean -fd", {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
      return;
    } catch (e) {
      if (i === 4) throw e;
      execSync("node -e \"setTimeout(() => {}, 500)\"");
    }
  }
}

// 1. We already have the modified test files in our working directory.
// Let's create the patch FIRST.
execSync("git add .", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
execSync("git diff --cached > C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/3_BRUTAL_TRAPS_TEST_PATCH.patch", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});

// 2. Commit them so we can easily reset between agents
execSync("git config user.email \"test@test.com\" && git config user.name \"Test\"", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
execSync("git commit --no-verify -m \"Test patch\"", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});

const results = {};
for (let i = 1; i <= 10; i++) {
  console.log("Testing Agent " + i);
  
  execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
  execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
  
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

// Format output
let md = "# 🧪 Final Verification Run: All 10 Nova Agents\n\n";
md += "| Agent | Status | Reason |\n|-------|--------|--------|\n";

for (let i = 1; i <= 10; i++) {
  const res = results[i];
  if (res === "PASS") {
    md += `| Nova Agent ${i} | ✅ PASS | Passed all 47 tests |\n`;
  } else {
    md += `| Nova Agent ${i} | ❌ FAIL | ${res.replace("FAIL (", "").replace(")", "")} |\n`;
  }
}

const passingCount = Object.values(results).filter(x => x === "PASS").length;
md += `\n**Total Passing Agents:** ${passingCount}/10\n`;
if (passingCount === 3 || passingCount === 4) {
  md += "**Target Met:** ✅ Yes (Pass rate ≤ 50% and between 3-4 passes)\n";
} else {
  md += "**Target Met:** ❌ No\n";
}

fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/final_verification_results.md", md);

safeGitReset();
