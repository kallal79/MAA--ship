const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const zodDir = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const maaDir = 'C:/Users/USER/OneDrive/Desktop/MAA';
const uploadDir = path.join(maaDir, 'FINAL_UPLOAD');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Copy test.ts to spec.ts as well
const testTsPath = path.join(zodDir, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts');
const specTsPath = path.join(zodDir, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts');
if (fs.existsSync(testTsPath)) {
  fs.copyFileSync(testTsPath, specTsPath);
}

// 1. Solution patch (source files only)
const srcFiles = [
  'packages/zod/src/v4/classic/schemas.ts',
  'packages/zod/src/v4/classic/external.ts',
  'packages/zod/src/v4/core/api.ts',
  'packages/zod/src/v4/core/parse.ts',
  'packages/zod/src/v4/core/schemas.ts',
  'packages/zod/src/v4/mini/schemas.ts',
  'packages/zod/src/v4/mini/external.ts'
];

cp.execSync('git reset HEAD', { cwd: zodDir });
for (const f of srcFiles) {
  if (fs.existsSync(path.join(zodDir, f))) {
    cp.execSync(`git add "${f}"`, { cwd: zodDir });
  }
}

let solutionDiff = cp.execSync('git diff --cached HEAD', { cwd: zodDir, encoding: 'utf8' });
solutionDiff = solutionDiff.replace(/\r\n/g, '\n');

fs.writeFileSync(path.join(maaDir, 'CLEAN_SOLUTION_FINAL.patch'), solutionDiff, 'utf8');
fs.writeFileSync(path.join(uploadDir, 'solution.patch'), solutionDiff, 'utf8');
console.log('Generated solution.patch (bytes: ' + solutionDiff.length + ')');

// Unstage
cp.execSync('git reset HEAD', { cwd: zodDir });

// 2. Test patch (test files + test.sh)
const testFiles = [
  'packages/zod/src/v4/classic/tests/default.test.ts',
  'packages/zod/src/v4/mini/tests/index.test.ts',
  'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts',
  'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts'
];

for (const f of testFiles) {
  if (fs.existsSync(path.join(zodDir, f))) {
    cp.execSync(`git add "${f}"`, { cwd: zodDir });
  }
}

let testDiff = cp.execSync('git diff --cached HEAD', { cwd: zodDir, encoding: 'utf8' });
testDiff = testDiff.replace(/\r\n/g, '\n');

fs.writeFileSync(path.join(maaDir, 'CLEAN_TEST_FINAL.patch'), testDiff, 'utf8');
fs.writeFileSync(path.join(uploadDir, 'test.patch'), testDiff, 'utf8');
console.log('Generated test.patch (bytes: ' + testDiff.length + ')');

// Unstage
cp.execSync('git reset HEAD', { cwd: zodDir });
