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

const summary = [];

for (let i = 1; i <= 13; i++) {
  cleanRepo();
  const patchFile = path.join(AGENT_DIR, 'Nova_Nova_' + i, 'solution-patch.patch');
  if (!fs.existsSync(patchFile)) continue;

  const patchContent = fs.readFileSync(patchFile, 'utf8').replace(/\r\n/g, '\n');
  const tmpPatch = path.join(ZOD_DIR, '_tmp.patch');
  fs.writeFileSync(tmpPatch, patchContent, 'utf8');

  let applied = true;
  try {
    execSync('git apply --whitespace=fix _tmp.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
  } catch (e) {
    applied = false;
  }
  if (fs.existsSync(tmpPatch)) fs.unlinkSync(tmpPatch);
  if (!applied) {
    summary.push({ agent: 'Nova #' + i, status: 'PATCH_APPLY_FAILED', passed: 0, failed: 29 });
    continue;
  }

  try {
    execSync(`git apply --whitespace=fix "${TEST_PATCH}"`, { cwd: ZOD_DIR, stdio: 'pipe' });
  } catch (e) {
    summary.push({ agent: 'Nova #' + i, status: 'TEST_APPLY_FAILED', passed: 0, failed: 29 });
    continue;
  }

  try {
    const out = execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck --typecheck.enabled=false', {
      cwd: ZOD_DIR,
      stdio: 'pipe',
      timeout: 60000
    }).toString('utf8');

    const m = out.match(/Tests\s+(\d+)\s+passed\s*\((\d+)\)/);
    const passed = m ? parseInt(m[1], 10) : 29;
    const total = m ? parseInt(m[2], 10) : 29;
    summary.push({ agent: 'Nova #' + i, status: passed === total ? 'PASS' : 'FAIL', passed, failed: total - passed });
  } catch (err) {
    const out = (err.stdout ? err.stdout.toString('utf8') : '') + (err.stderr ? err.stderr.toString('utf8') : '');
    const m = out.match(/Tests\s+(?:(\d+)\s+failed\s*\|\s*)?(\d+)\s+passed/);
    let passedCount = 0;
    let failedCount = 29;
    if (m) {
      if (m[1]) failedCount = parseInt(m[1], 10);
      if (m[2]) passedCount = parseInt(m[2], 10);
    }
    summary.push({ agent: 'Nova #' + i, status: 'FAIL', passed: passedCount, failed: failedCount });
  }
}

cleanRepo();
console.table(summary);

const passes = summary.filter(s => s.status === 'PASS');
console.log(`Total Passes: ${passes.length} / ${summary.length} (${((passes.length/summary.length)*100).toFixed(1)}%)`);
console.log(`Pass list: ${passes.map(p => p.agent).join(', ')}`);
