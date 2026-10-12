const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const zodDir = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const destSolPatch = 'C:/Users/USER/OneDrive/Desktop/MAA/scratch/calibrated_solution.patch';
const destTestPatch = 'C:/Users/USER/OneDrive/Desktop/MAA/scratch/calibrated_test.patch';

// 1. Generate solution diff against HEAD
const solDiff = execSync(
  'git diff HEAD -- packages/zod/src/v4/classic/schemas.ts packages/zod/src/v4/core/api.ts packages/zod/src/v4/core/schemas.ts packages/zod/src/v4/mini/schemas.ts',
  { cwd: zodDir, encoding: 'utf8' }
);
fs.writeFileSync(destSolPatch, solDiff.replace(/\r\n/g, '\n'), 'utf8');
console.log('Saved calibrated_solution.patch, bytes:', Buffer.byteLength(solDiff, 'utf8'));

// 2. Add test files to git index temporarily to diff against HEAD
execSync('git add -N test.sh packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts', { cwd: zodDir });
const testDiff = execSync(
  'git diff HEAD -- test.sh packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts',
  { cwd: zodDir, encoding: 'utf8' }
);
fs.writeFileSync(destTestPatch, testDiff.replace(/\r\n/g, '\n'), 'utf8');
console.log('Saved calibrated_test.patch, bytes:', Buffer.byteLength(testDiff, 'utf8'));
