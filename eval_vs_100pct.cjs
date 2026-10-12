const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const newAgentDir = "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-NEW";
const repoDir = "C:/Users/USER/OneDrive/Desktop/MAA/zod";
const testPatch = "C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH_100_PERCENT.patch";

function testAgent(agentPatch, label) {
  try {
    execSync('git reset --hard HEAD', { cwd: repoDir, stdio: 'ignore' });
    execSync('git clean -fd', { cwd: repoDir, stdio: 'ignore' });
    execSync(`git apply "${agentPatch}"`, { cwd: repoDir, stdio: 'ignore' });
    execSync(`git apply "${testPatch}"`, { cwd: repoDir, stdio: 'ignore' });
    try {
      execSync('pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false', {
        cwd: repoDir, stdio: 'ignore', timeout: 60000
      });
      return `${label}: ✅ PASS`;
    } catch (e) {
      return `${label}: ❌ FAIL`;
    }
  } catch (e) {
    return `${label}: ❌ FAIL (patch error: ${e.message.substring(0,120)})`;
  }
}

console.log("\n=== NEW 13 Agents vs FINAL_TEST_PATCH_100_PERCENT ===");
let passes = 0;
for (let i = 1; i <= 13; i++) {
  const agentPatch = path.join(newAgentDir, `Nova_Nova_${i}`, 'solution-patch.patch');
  if (!fs.existsSync(agentPatch)) { console.log(`Agent ${i}: MISSING`); continue; }
  const result = testAgent(agentPatch, `Agent ${i}`);
  console.log(result);
  if (result.includes('PASS')) passes++;
}
console.log(`\nTotal: ${passes}/13 pass`);
