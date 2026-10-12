const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const zodDir = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const maaDir = 'C:/Users/USER/OneDrive/Desktop/MAA';
const solPatch = path.join(maaDir, 'FINAL_UPLOAD/solution.patch');
const testPatch = path.join(maaDir, 'FINAL_UPLOAD/test.patch');

console.log('=== FULL TYPECHECK & AUDIT CHECK ===');

// 1. Reset repo to base commit
cp.execSync('git reset HEAD --hard', { cwd: zodDir, stdio: 'ignore' });
cp.execSync('git clean -fd', { cwd: zodDir, stdio: 'ignore' });
cp.execSync('git checkout 1fb56a5c', { cwd: zodDir, stdio: 'ignore' });

// 2. Apply patches
cp.execSync(`git apply "${solPatch}"`, { cwd: zodDir, stdio: 'ignore' });
cp.execSync(`git apply "${testPatch}"`, { cwd: zodDir, stdio: 'ignore' });

// Ensure vitest config has typecheck ENABLED
['vitest.config.ts', 'packages/zod/vitest.config.ts'].forEach(f => {
  const full = path.join(zodDir, f);
  if (fs.existsSync(full)) {
    let content = fs.readFileSync(full, 'utf8');
    content = content.replace(/enabled:\s*false/g, 'enabled: true');
    fs.writeFileSync(full, content, 'utf8');
  }
});

// 3. Run vitest WITH TYPECHECK ENABLED
try {
  console.log('Running vitest WITH typechecking enabled...');
  const out = cp.execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts', { cwd: zodDir, encoding: 'utf8' });
  console.log('VITEST STDOUT:\n', out);
} catch (e) {
  console.log('VITEST ERROR:\n', e.stdout || e.stderr || e.message);
}
