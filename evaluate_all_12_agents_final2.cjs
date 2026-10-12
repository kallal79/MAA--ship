const fs = require("fs");
const { execSync } = require("child_process");

const results = {};

for (let i = 1; i <= 12; i++) {
  console.log("Testing Agent " + i);
  execSync("git reset --hard HEAD", {stdio: "ignore"});
  execSync("git clean -fd", {stdio: "ignore"});
  
  try {
    execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore"});
  } catch (e) {
    results[i] = "FAIL (solution patch failed to apply)";
    continue;
  }
  
  try {
    execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/FINAL_TEST_PATCH_TO_UPLOAD.patch"`, {stdio: "ignore"});
  } catch (e) {
    results[i] = "FAIL (test patch failed to apply)";
    continue;
  }
  
  try {
    execSync(`pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false`, {stdio: "ignore", timeout: 15000});
    results[i] = "PASS";
  } catch (e) {
    if (e.code === 'ETIMEDOUT') {
      results[i] = "FAIL (TIMEOUT / INFINITE LOOP)";
    } else {
      results[i] = "FAIL (TEST FAILED)";
    }
  }
}

// Write the result nicely to a markdown file to present to the user
let md = "# 🧪 Final Verification Run: All 12 Nova Agents\n\n";
md += "| Agent | Status | Reason |\n|-------|--------|--------|\n";

for (let i = 1; i <= 12; i++) {
  const res = results[i];
  if (res === "PASS") {
    md += `| Nova Agent ${i} | ✅ PASS | Passed all tests (including discriminators) |\n`;
  } else {
    md += `| Nova Agent ${i} | ❌ FAIL | ${res.replace("FAIL (", "").replace(")", "")} |\n`;
  }
}

const passingCount = Object.values(results).filter(x => x === "PASS").length;
md += `\n**Total Passing Agents:** ${passingCount}/12\n`;
if (passingCount === 3 || passingCount === 4) {
  md += "**Target Met:** ✅ Yes (Pass rate ≤ 50% and between 3-4 passes)\n";
} else {
  md += "**Target Met:** ❌ No\n";
}

fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/final_verification_results.md", md);
console.log("Evaluation complete. Results written to final_verification_results.md");
