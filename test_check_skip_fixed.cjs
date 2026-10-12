const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const zodDir = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const agentsDir = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-3RAMRAM';
const solPatch = 'C:/Users/USER/OneDrive/Desktop/MAA/CLEAN_SOLUTION_FINAL.patch';

// Read test patch content from TEST_PATCH_3_PASS.patch
const patchContent = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/TEST_PATCH_3_PASS.patch', 'utf8');

// Extract test file content from patch
const testFileLines = [];
let inTestFile = false;
for (const line of patchContent.split('\n')) {
  if (line.startsWith('+++ b/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts')) {
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

const testDest = path.join(zodDir, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts');
const specDest = path.join(zodDir, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts');

function resetRepo() {
  try {
    cp.execSync('git reset HEAD --hard', { cwd: zodDir, stdio: 'ignore' });
    cp.execSync('git clean -fd', { cwd: zodDir, stdio: 'ignore' });
    cp.execSync('git checkout 1fb56a5c', { cwd: zodDir, stdio: 'ignore' });
  } catch (e) {}
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
  fs.writeFileSync(specDest, testFileContent, 'utf8');
}

const targetAgents = ['Nova_Nova_11', 'Nova_Nova_19', 'Nova_Nova_32', 'Nova_Nova_1', 'Nova_Nova_2'];

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
    const out = cp.execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts --no-typecheck', { cwd: zodDir, encoding: 'utf8' });
    if (out.includes('46 passed') || out.includes('Test Files  1 passed')) {
      console.log(`${agent}: PASS`);
    } else {
      console.log(`${agent}: FAIL`);
    }
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
  const out = cp.execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts --no-typecheck', { cwd: zodDir, encoding: 'utf8' });
  if (out.includes('46 passed') || out.includes('Test Files  1 passed')) {
    console.log(`FINAL_SOLUTION: PASS (100%)`);
  } else {
    console.log(`FINAL_SOLUTION: FAIL`);
  }
} catch (e) {
  console.log(`FINAL_SOLUTION: FAIL`);
}
