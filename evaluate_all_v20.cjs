const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const agentsDir = "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE";
const repoDir = "C:/Users/USER/OneDrive/Desktop/MAA/zod";
const testPatch = "C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH_V20.patch";

console.log("Starting Evaluation of All 12 Agents with V20 patch...");

let passes = 0;
let results = [];

for (let i = 1; i <= 12; i++) {
  console.log(`\nTesting Agent ${i}...`);
  try {
    // 1. Reset repo
    execSync('git reset --hard HEAD', { cwd: repoDir, stdio: 'ignore' });
    execSync('git clean -fd', { cwd: repoDir, stdio: 'ignore' });
    
    // 2. Apply agent patch
    const agentPatch = path.join(agentsDir, `Nova_Nova_${i}`, 'solution-patch.patch');
    if (!fs.existsSync(agentPatch)) {
      console.log(`  Agent ${i} patch not found! SKIP`);
      continue;
    }
    
    execSync(`git apply "${agentPatch}"`, { cwd: repoDir, stdio: 'ignore' });
    
    // 3. Apply test patch
    execSync(`git apply "${testPatch}"`, { cwd: repoDir, stdio: 'ignore' });
    
    // 4. Run tests
    try {
      execSync('pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false', { cwd: repoDir, stdio: 'ignore', timeout: 30000 });
      console.log(`  RESULT: PASS`);
      passes++;
      results.push(`Agent ${i}: PASS`);
    } catch (e) {
      console.log(`  RESULT: FAIL`);
      results.push(`Agent ${i}: FAIL (tests failed)`);
    }
  } catch (e) {
    console.log(`  RESULT: FAIL (Patch application error)`);
    results.push(`Agent ${i}: FAIL (patch error)`);
  }
}

console.log(`\n\n=== FINAL RESULTS ===`);
console.log(results.join('\n'));
console.log(`\nTotal Passes: ${passes}/12`);
