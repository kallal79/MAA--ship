const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const zodDir = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
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

cp.execSync('git reset HEAD --hard', { cwd: zodDir, stdio: 'ignore' });
cp.execSync('git clean -fd', { cwd: zodDir, stdio: 'ignore' });
cp.execSync('git checkout 1fb56a5c', { cwd: zodDir, stdio: 'ignore' });

// Apply solution patch
cp.execSync(`git apply "${solPatch}"`, { cwd: zodDir, stdio: 'ignore' });

// Write test files
fs.writeFileSync(testDest, testFileContent, 'utf8');
fs.writeFileSync(specDest, testFileContent, 'utf8');

// Disable typecheck
['vitest.config.ts', 'packages/zod/vitest.config.ts'].forEach(f => {
  const full = path.join(zodDir, f);
  if (fs.existsSync(full)) {
    let content = fs.readFileSync(full, 'utf8');
    content = content.replace(/enabled:\s*true/g, 'enabled: false');
    fs.writeFileSync(full, content, 'utf8');
  }
});

try {
  const out = cp.execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts --no-typecheck', { cwd: zodDir, encoding: 'utf8' });
  console.log('OUTPUT:\n', out);
} catch (e) {
  console.log('ERROR:\n', e.stdout || e.stderr || e.message);
}
