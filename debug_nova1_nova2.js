const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';
const TEST_PATCH = 'C:/Users/USER/OneDrive/Desktop/MAA/1_UPLOAD_THIS_AS_TEST_PATCH/test.patch';

function cleanRepo() {
  try {
    execSync('git reset --hard HEAD', { cwd: ZOD_DIR, stdio: 'pipe' });
    execSync('git clean -fd', { cwd: ZOD_DIR, stdio: 'pipe' });
  } catch (e) {}
}

for (const id of ['solution', 1, 2]) {
  cleanRepo();
  if (id === 'solution') {
    execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/MAA/2_UPLOAD_THIS_AS_SOLUTION_PATCH/solution.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
  } else {
    const p = path.join(AGENT_DIR, 'Nova_Nova_' + id, 'solution-patch.patch');
    let txt = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
    const tmp = path.join(ZOD_DIR, '_tmp.patch');
    fs.writeFileSync(tmp, txt, 'utf8');
    execSync('git apply --whitespace=fix _tmp.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  }

  execSync('git apply --whitespace=fix "' + TEST_PATCH + '"', { cwd: ZOD_DIR, stdio: 'pipe' });

  try {
    const out = execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', {
      cwd: ZOD_DIR,
      stdio: 'pipe',
      timeout: 30000
    }).toString('utf8');
    console.log(`\n=== Agent ${id}: ALL 24 TESTS PASSED ===`);
  } catch (err) {
    const out = (err.stdout ? err.stdout.toString('utf8') : '') + (err.stderr ? err.stderr.toString('utf8') : '');
    console.log(`\n=== Agent ${id}: SOME TESTS FAILED ===`);
    const lines = out.split('\n');
    for (const l of lines) {
      if (l.includes('FAIL') || l.includes('AssertionError') || l.includes('Tests ')) {
        console.log('  ' + l);
      }
    }
  }
}
cleanRepo();
