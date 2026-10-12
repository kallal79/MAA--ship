const { execSync } = require('child_process');
const fs = require('fs');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';

execSync('git reset --hard HEAD', { cwd: ZOD_DIR, stdio: 'pipe' });
execSync('git clean -fd', { cwd: ZOD_DIR, stdio: 'pipe' });
execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/MAA/2_UPLOAD_THIS_AS_SOLUTION_PATCH/solution.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/MAA/1_UPLOAD_THIS_AS_TEST_PATCH/test.patch', { cwd: ZOD_DIR, stdio: 'pipe' });

try {
  const out = execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', {
    cwd: ZOD_DIR,
    stdio: 'pipe'
  }).toString('utf8');
  console.log('SOLUTION WITH BASE TEST PATCH:');
  console.log(out);
} catch (e) {
  console.log('ERROR:');
  console.log((e.stdout ? e.stdout.toString('utf8') : '') + (e.stderr ? e.stderr.toString('utf8') : ''));
}
