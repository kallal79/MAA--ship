const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const agentsDir = "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE";
const repoDir = "C:/Users/USER/OneDrive/Desktop/MAA/zod";
const testSrc = "C:/Users/USER/OneDrive/Desktop/MAA/nested_defaults_test.spec.ts";
const testDest = "C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/nested_defaults_test.spec.ts";

console.log("Testing Nested Defaults on 12 FINAL Agents...\n");

for (let i = 1; i <= 12; i++) {
  try {
    execSync('git reset --hard HEAD', { cwd: repoDir, stdio: 'ignore' });
    execSync('git clean -fd', { cwd: repoDir, stdio: 'ignore' });

    const agentPatch = path.join(agentsDir, `Nova_Nova_${i}`, 'solution-patch.patch');
    if (!fs.existsSync(agentPatch)) continue;
    execSync(`git apply "${agentPatch}"`, { cwd: repoDir, stdio: 'ignore' });
    
    fs.copyFileSync(testSrc, testDest);
    
    // We append the fs write sync result
    try {
      execSync('pnpm vitest run packages/zod/src/v4/classic/tests/nested_defaults_test.spec.ts --typecheck.enabled=false', {
        cwd: repoDir, stdio: 'ignore', timeout: 30000
      });
    } catch(e) {}
  } catch(e) {}
}
