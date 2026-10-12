const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const SOL_PATCH = 'C:/Users/USER/OneDrive/Desktop/MAA/2_UPLOAD_THIS_AS_SOLUTION_PATCH/solution.patch';
const TEST_PATCH = 'C:/Users/USER/OneDrive/Desktop/MAA/1_UPLOAD_THIS_AS_TEST_PATCH/test.patch';
const SPEC = 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts';
const SPEC_FULL = path.join(ZOD_DIR, SPEC);

// Reset
execSync('git reset --hard HEAD', { cwd: ZOD_DIR, stdio: 'pipe' });
execSync('git clean -fd', { cwd: ZOD_DIR, stdio: 'pipe' });
console.log('After clean, spec exists:', fs.existsSync(SPEC_FULL));

// Apply sol patch
try {
  execSync(`git apply --whitespace=fix "${SOL_PATCH}"`, { cwd: ZOD_DIR, stdio: 'pipe' });
  console.log('sol.patch: OK');
} catch(e) {
  console.log('sol.patch: FAIL', e.stderr ? e.stderr.toString() : e.message);
}
console.log('After sol, spec exists:', fs.existsSync(SPEC_FULL));

// Apply test patch
try {
  execSync(`git apply --whitespace=fix "${TEST_PATCH}"`, { cwd: ZOD_DIR, stdio: 'pipe' });
  console.log('test.patch: OK');
} catch(e) {
  console.log('test.patch: FAIL', e.stderr ? e.stderr.toString() : e.message);
}
console.log('After test, spec exists:', fs.existsSync(SPEC_FULL));
console.log('After test, test.sh exists:', fs.existsSync(path.join(ZOD_DIR, 'test.sh')));

// Now run vitest via cmd /c redirect
const tmpOut = path.join(ZOD_DIR, '_debug_out.txt');
if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);

try {
  execSync(`cmd /c "npx vitest run ${SPEC} --no-typecheck --typecheck.enabled=false > _debug_out.txt 2>&1"`, {
    cwd: ZOD_DIR, timeout: 30000
  });
} catch(e) {}

if (fs.existsSync(tmpOut)) {
  const content = fs.readFileSync(tmpOut, 'utf8');
  console.log('\nVitest output (relevant lines):');
  content.split('\n').forEach(l => {
    const clean = l.replace(/\u001b\[[0-9;]*m/g, '').trim();
    if (clean) console.log(' ', clean);
  });
  fs.unlinkSync(tmpOut);
} else {
  console.log('No output file!');
}
