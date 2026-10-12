const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const agentsDir = "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-ORIGINAL-ONE";
const repoDir = "C:/Users/USER/OneDrive/Desktop/MAA/zod";
const testPatch = "C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH_V22.patch";

console.log("Testing 3 ORIGINAL Nova Agents with current test patch (V22)...\n");

let passes = 0;
let results = [];

for (let i = 1; i <= 3; i++) {
  console.log(`Testing Agent ${i}...`);
  try {
    execSync('git reset --hard HEAD', { cwd: repoDir, stdio: 'ignore' });
    execSync('git clean -fd', { cwd: repoDir, stdio: 'ignore' });

    const agentPatch = path.join(agentsDir, `Nova_Nova_${i}`, 'solution-patch.patch');
    execSync(`git apply "${agentPatch}"`, { cwd: repoDir, stdio: 'ignore' });
    execSync(`git apply "${testPatch}"`, { cwd: repoDir, stdio: 'ignore' });

    try {
      execSync('pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false', {
        cwd: repoDir, stdio: 'ignore', timeout: 60000
      });
      console.log(`  ✅ PASS`);
      passes++;
      results.push(`Agent ${i}: PASS`);
    } catch (e) {
      console.log(`  ❌ FAIL (tests failed)`);
      results.push(`Agent ${i}: FAIL`);
    }
  } catch (e) {
    console.log(`  ❌ FAIL (patch error: ${e.message.substring(0,80)})`);
    results.push(`Agent ${i}: FAIL (patch error)`);
  }
}

console.log(`\n=== ORIGINAL AGENT RESULTS ===`);
results.forEach(r => console.log(r));
console.log(`\nTotal Passes: ${passes}/3`);
