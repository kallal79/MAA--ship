const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const agentsDir = "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-ORIGINAL-ONE";
const repoDir = "C:/Users/USER/OneDrive/Desktop/MAA/zod";
const testSrc = "C:/Users/USER/OneDrive/Desktop/MAA/sparse_test.spec.ts";
const testDest = "C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/sparse_test.spec.ts";

console.log("Testing Pipe Behavior on 3 ORIGINAL Nova Agents...\n");

for (let i = 1; i <= 3; i++) {
  console.log(`Testing Agent ${i}...`);
  try {
    execSync('git reset --hard HEAD', { cwd: repoDir, stdio: 'ignore' });
    execSync('git clean -fd', { cwd: repoDir, stdio: 'ignore' });

    const agentPatch = path.join(agentsDir, `Nova_Nova_${i}`, 'solution-patch.patch');
    execSync(`git apply "${agentPatch}"`, { cwd: repoDir, stdio: 'ignore' });
    
    fs.copyFileSync(testSrc, testDest);

    try {
      execSync('pnpm vitest run packages/zod/src/v4/classic/tests/sparse_test.spec.ts --typecheck.enabled=false', {
        cwd: repoDir, stdio: 'ignore', timeout: 30000
      });
      console.log(`  ✅ PASS`);
    } catch (e) {
      console.log(`  ❌ FAIL (tests failed)`);
    }
  } catch (e) {
    console.log(`  ❌ FAIL (patch error)`);
  }
}
