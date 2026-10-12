const fs = require("fs");
const { execSync } = require("child_process");

const results = {};

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

for (let i = 1; i <= 11; i++) {
  console.log("Testing Agent " + i);
  safeGitReset();
  
  try {
    execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
  } catch (e) {
    results[i] = "FAIL (solution patch failed to apply)";
    continue;
  }
  
  try {
    execSync(`git apply "C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH_V15_GUARANTEED_FAILS.patch"`, {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
  } catch (e) {
    console.log("Test patch failed to apply, skipping...");
  }
  
  try {
    execSync("pnpm vitest run encode-defaults.8a4f9b.spec.ts encode-defaults-skipEncoding-types.spec.ts", {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
    results[i] = "PASS";
  } catch (e) {
    results[i] = "FAIL (tests failed)";
  }
}

safeGitReset();

console.log("\n--- RESULTS ---");
for (let i = 1; i <= 11; i++) {
  console.log(`Agent ${i}: ${results[i]}`);
}

let md = "# 🧪 Final Verification Run: All 12 Nova Agents\n\n";
md += "| Agent | Status | Reason |\n|-------|--------|--------|\n";

for (let i = 1; i <= 11; i++) {
  const res = results[i] || "FAIL (UNKNOWN)";
  md += `| Nova Agent ${i} | ${res.startsWith("PASS") ? "✅ PASS" : "❌ FAIL"} | ${res.replace("FAIL (", "").replace(")", "")} |\n`;
}

const passingCount = Object.values(results).filter(x => x === "PASS").length;
md += `\n**Total Passing Agents:** ${passingCount}/12\n`;
if (passingCount === 3 || passingCount === 4) {
  md += "**Target Met:** ✅ Yes (Pass rate ≤ 50% and between 3-4 passes)\n";
} else {
  md += "**Target Met:** ❌ No\n";
}

fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/final_verification_results.md", md);
