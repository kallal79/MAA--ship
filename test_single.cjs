const fs = require('fs');
const cp = require('child_process');
const path = require('path');
const os = require('os');

const agent = 'Nova_Nova_1';
const agentsDir = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE';
const zodDir = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const agentPatch = path.join(agentsDir, agent, 'solution-patch.patch');

const patchContent = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_PERFECT_TEST_PATCH.patch', 'utf8');
const testFileLines = [];
let inTestFile = false;
for (const line of patchContent.split('\n')) {
  if (line.startsWith('+++ b/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts')) {
    inTestFile = true;
    continue;
  }
  if (inTestFile) {
    if (line.startsWith('diff --git') || line.startsWith('--- ')) break;
    if (line.startsWith('+')) {
      testFileLines.push(line.slice(1));
    }
  }
}
const testFileContent = testFileLines.join('\n');

const workDir = path.join(os.tmpdir(), 'zod_eval_test_' + agent);
if (fs.existsSync(workDir)) {
  fs.rmSync(workDir, { recursive: true, force: true });
}

cp.execSync(`git clone ${zodDir} ${workDir}`, { stdio: 'inherit' });
cp.execSync('git checkout 1fb56a5c', { cwd: workDir, stdio: 'inherit' });
cp.execSync('git clean -fd', { cwd: workDir, stdio: 'inherit' });

try {
  cp.execSync(`git apply "${agentPatch}"`, { cwd: workDir, stdio: 'inherit' });
} catch (e1) {
  console.error("Patch failed to apply");
}

const testDest = path.join(workDir, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts');
fs.writeFileSync(testDest, testFileContent, 'utf8');

const output = cp.execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', { cwd: workDir, encoding: 'utf8' });
console.log(output);
