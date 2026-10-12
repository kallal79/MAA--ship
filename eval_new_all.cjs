const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const originalDir = "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-ORIGINAL-ONE";
const finalDir = "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE";
const repoDir = "C:/Users/USER/OneDrive/Desktop/MAA/zod";
const testPatch = "C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/NEW_FIXED_TEST_PATCH.patch";

console.log("Testing ORIGINAL 3 Agents with V24 patch...\n");
let origPasses = 0;
let origResults = [];

for (let i = 1; i <= 3; i++) {
  try {
    execSync('git reset --hard HEAD', { cwd: repoDir, stdio: 'ignore' });
    execSync('git clean -fd', { cwd: repoDir, stdio: 'ignore' });

    const agentPatch = path.join(originalDir, `Nova_Nova_${i}`, 'solution-patch.patch');
    execSync(`git apply "${agentPatch}"`, { cwd: repoDir, stdio: 'ignore' });
    execSync(`git apply "${testPatch}"`, { cwd: repoDir, stdio: 'ignore' });

    try {
      execSync('pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false', {
        cwd: repoDir, stdio: 'ignore', timeout: 30000
      });
      origPasses++;
      origResults.push(`Agent ${i}: PASS`);
    } catch (e) {
      origResults.push(`Agent ${i}: FAIL`);
    }
  } catch (e) {
    origResults.push(`Agent ${i}: FAIL (patch error)`);
  }
}

console.log("Testing FINAL 12 Agents with V24 patch...\n");
let finalPasses = 0;
let finalResults = [];

for (let i = 1; i <= 12; i++) {
  try {
    execSync('git reset --hard HEAD', { cwd: repoDir, stdio: 'ignore' });
    execSync('git clean -fd', { cwd: repoDir, stdio: 'ignore' });

    const agentPatch = path.join(finalDir, `Nova_Nova_${i}`, 'solution-patch.patch');
    if (!fs.existsSync(agentPatch)) continue;
    execSync(`git apply "${agentPatch}"`, { cwd: repoDir, stdio: 'ignore' });
    execSync(`git apply "${testPatch}"`, { cwd: repoDir, stdio: 'ignore' });

    try {
      execSync('pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false', {
        cwd: repoDir, stdio: 'ignore', timeout: 30000
      });
      finalPasses++;
      finalResults.push(`Agent ${i}: PASS`);
    } catch (e) {
      finalResults.push(`Agent ${i}: FAIL`);
    }
  } catch (e) {
    finalResults.push(`Agent ${i}: FAIL (patch error)`);
  }
}

console.log(`\n=== ORIGINAL AGENT RESULTS ===`);
origResults.forEach(r => console.log(r));
console.log(`Total Passes: ${origPasses}/3`);

console.log(`\n=== FINAL AGENT RESULTS ===`);
finalResults.forEach(r => console.log(r));
console.log(`Total Passes: ${finalPasses}/12`);
