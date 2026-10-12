const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const zodDir = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const agentsDir = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-3RAMRAM';
const solPatch = 'C:/Users/USER/OneDrive/Desktop/MAA/FINAL_UPLOAD/solution.patch';

// Read test patch content from TEST_PATCH_3_PASS_FIXED.patch
const patchContent = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/TEST_PATCH_3_PASS_FIXED.patch', 'utf8');

// Extract test file content from patch
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
const testDest = path.join(zodDir, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts');
const testDest2 = path.join(zodDir, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts');

function resetRepo() {
  cp.execSync('git reset HEAD --hard', { cwd: zodDir, stdio: 'ignore' });
  cp.execSync('git clean -fd', { cwd: zodDir, stdio: 'ignore' });
  cp.execSync('git checkout 1fb56a5c', { cwd: zodDir, stdio: 'ignore' });
}

function disableTypecheck() {
  ['vitest.config.ts', 'packages/zod/vitest.config.ts'].forEach(f => {
    const full = path.join(zodDir, f);
    if (fs.existsSync(full)) {
      let content = fs.readFileSync(full, 'utf8');
      content = content.replace(/enabled:\s*true/g, 'enabled: false');
      fs.writeFileSync(full, content, 'utf8');
    }
  });
}

function writeTests() {
  fs.writeFileSync(testDest, testFileContent, 'utf8');
  fs.writeFileSync(testDest2, testFileContent, 'utf8');
}

const targetAgents = ['Nova_Nova_11', 'Nova_Nova_19', 'Nova_Nova_32', 'Nova_Nova_1'];

for (const agent of targetAgents) {
  resetRepo();
  disableTypecheck();
  writeTests();

  try {
    cp.execSync(`git apply "${path.join(agentsDir, agent, 'solution-patch.patch')}"`, { cwd: zodDir, stdio: 'ignore' });
  } catch (e) {
    try {
      cp.execSync(`git apply --ignore-whitespace "${path.join(agentsDir, agent, 'solution-patch.patch')}"`, { cwd: zodDir, stdio: 'ignore' });
    } catch (e2) {}
  }

  try {
    cp.execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', { cwd: zodDir, stdio: 'ignore' });
    console.log(`${agent}: PASS`);
  } catch (e) {
    console.log(`${agent}: FAIL`);
  }
}

// Check final reference solution
resetRepo();
disableTypecheck();
writeTests();

try {
  cp.execSync(`git apply "${solPatch}"`, { cwd: zodDir, stdio: 'ignore' });
} catch (e) {
  cp.execSync(`git apply --ignore-whitespace "${solPatch}"`, { cwd: zodDir, stdio: 'ignore' });
}

try {
  cp.execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', { cwd: zodDir, stdio: 'ignore' });
  console.log(`FINAL_SOLUTION: PASS`);
} catch (e) {
  console.log(`${e.stdout || e.stderr || e.message}`);
  console.log(`FINAL_SOLUTION: FAIL`);
}
