const fs = require("fs");
const { execSync } = require("child_process");

const results = {};
const patchPath = process.argv[2] || "C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH_V18.patch";
const cwdPath = "C:/Users/USER/OneDrive/Desktop/MAA/zod-v1";

for (let i = 1; i <= 12; i++) {
  console.log("Testing Agent " + i);
  execSync("git reset --hard HEAD", {cwd: cwdPath, stdio: "ignore"});
  execSync("git clean -fd", {cwd: cwdPath, stdio: "ignore"});
  
  try {
    execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {cwd: cwdPath, stdio: "ignore"});
  } catch (e) {
    results[i] = "FAIL (solution patch failed to apply)";
    continue;
  }
  
  try {
    execSync(`git apply "${patchPath}"`, {cwd: cwdPath, stdio: "ignore"});
  } catch (e) {
    results[i] = "FAIL (test patch failed to apply)";
    continue;
  }
  
  try {
    execSync(`pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false`, {cwd: cwdPath, stdio: "ignore", timeout: 15000});
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
let md = "# 🏆 Final Verification Run: All 12 Nova Agents\n\n";
md += "| Agent | Status | Reason |\n|-------|--------|--------|\n";

for (let i = 1; i <= 12; i++) {
  const res = results[i];
  if (res === "PASS") {
    md += `| Nova Agent ${i} | ✅ PASS | Passed all tests |\n`;
  } else {
    md += `| Nova Agent ${i} | ❌ FAIL | ${res.replace("FAIL (", "").replace(")", "")} |\n`;
  }
}

const passingCount = Object.values(results).filter(x => x === "PASS").length;
md += `\n**Total Passing Agents:** ${passingCount}/12\n`;
md += `**Target Met:** ${passingCount === 2 ? "✅ Yes (Exactly 2 passed)" : "❌ No"}\n`;

fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/final_verification_results.md", md);
console.log("Evaluation complete. Results written to final_verification_results.md");
