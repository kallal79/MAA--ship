const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const originalDir = "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-ORIGINAL-ONE";
const finalDir = "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE";
const repoDir = "C:/Users/USER/OneDrive/Desktop/MAA/zod";
const testPatch = "C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH.patch";

function testAgent(agentPatch, label) {
  try {
    execSync('git reset --hard HEAD', { cwd: repoDir, stdio: 'ignore' });
    execSync('git clean -fd', { cwd: repoDir, stdio: 'ignore' });
    execSync(`git apply "${agentPatch}"`, { cwd: repoDir, stdio: 'ignore' });
    execSync(`git apply "${testPatch}"`, { cwd: repoDir, stdio: 'ignore' });
    try {
      execSync('pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false', {
        cwd: repoDir, stdio: 'ignore', timeout: 45000
      });
      return `${label}: ✅ PASS`;
    } catch (e) {
      return `${label}: ❌ FAIL`;
    }
  } catch (e) {
    return `${label}: ❌ FAIL (patch error)`;
  }
}

console.log("\n=== ORIGINAL 3 Agents ===");
let origPasses = 0;
for (let i = 1; i <= 3; i++) {
  const agentPatch = path.join(originalDir, `Nova_Nova_${i}`, 'solution-patch.patch');
  const result = testAgent(agentPatch, `Original Agent ${i}`);
  console.log(result);
  if (result.includes('PASS')) origPasses++;
}
console.log(`Original Total: ${origPasses}/3 pass\n`);

console.log("=== FINAL 12 Agents ===");
let finalPasses = 0;
for (let i = 1; i <= 12; i++) {
  const agentPatch = path.join(finalDir, `Nova_Nova_${i}`, 'solution-patch.patch');
  if (!fs.existsSync(agentPatch)) continue;
  const result = testAgent(agentPatch, `Final Agent ${i}`);
  console.log(result);
  if (result.includes('PASS')) finalPasses++;
}
console.log(`Final Total: ${finalPasses}/12 pass`);
