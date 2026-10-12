const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';
const TEST_PATCH = 'C:/Users/USER/OneDrive/Desktop/MAA/1_UPLOAD_THIS_AS_TEST_PATCH/test.patch';

for (const id of [1, 2]) {
  execSync('git reset --hard HEAD', { cwd: ZOD_DIR, stdio: 'pipe' });
  execSync('git clean -fd', { cwd: ZOD_DIR, stdio: 'pipe' });

  const p = path.join(AGENT_DIR, 'Nova_Nova_' + id, 'solution-patch.patch');
  let txt = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
  const tmp = path.join(ZOD_DIR, '_tmp.patch');
  fs.writeFileSync(tmp, txt, 'utf8');
  execSync('git apply --whitespace=fix _tmp.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
  fs.unlinkSync(tmp);

  const tmpTest = path.join(ZOD_DIR, '_tmp_test.patch');
  fs.writeFileSync(tmpTest, fs.readFileSync(TEST_PATCH, 'utf8'), 'utf8');
  execSync('git apply --whitespace=fix _tmp_test.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
  fs.unlinkSync(tmpTest);

  console.log(`\n=================== NOVA #${id} FAILURES ===================`);
  try {
    const out = execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', {
      cwd: ZOD_DIR,
      stdio: 'pipe'
    }).toString('utf8');
    console.log('ALL PASSED!');
  } catch (err) {
    const out = (err.stdout ? err.stdout.toString('utf8') : '') + (err.stderr ? err.stderr.toString('utf8') : '');
    // print failing test names
    const lines = out.split('\n');
    for (const l of lines) {
      if (l.includes('FAIL') || l.includes('AssertionError') || l.includes('Expected') || l.includes('Received') || l.includes('Error:')) {
        console.log(l);
      }
    }
  }
}
