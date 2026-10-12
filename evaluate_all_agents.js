const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';
const TEST_PATCH = 'C:/Users/USER/OneDrive/Desktop/MAA/1_UPLOAD_THIS_AS_TEST_PATCH/test.patch';

const results = [];

function cleanRepo() {
  try {
    execSync('git reset --hard HEAD', { cwd: ZOD_DIR, stdio: 'pipe' });
    execSync('git clean -fd', { cwd: ZOD_DIR, stdio: 'pipe' });
  } catch (e) {}
}

// First evaluate reference solution
cleanRepo();
try {
  execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/MAA/2_UPLOAD_THIS_AS_SOLUTION_PATCH/solution.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
  execSync('git apply --whitespace=fix "' + TEST_PATCH + '"', { cwd: ZOD_DIR, stdio: 'pipe' });
  const out = execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', {
    cwd: ZOD_DIR,
    stdio: 'pipe',
    timeout: 60000
  }).toString('utf8');
  results.push({ agent: 'Reference Solution', verdict: 'SOLVED (PASS)', passed: '30/30' });
} catch (e) {
  results.push({ agent: 'Reference Solution', verdict: 'FAILED', passed: '0/30' });
}

for (let i = 1; i <= 13; i++) {
  cleanRepo();
  const agentFolder = path.join(AGENT_DIR, 'Nova_Nova_' + i);
  const patchFile = path.join(agentFolder, 'solution-patch.patch');
  if (!fs.existsSync(patchFile)) {
    results.push({ agent: 'Nova #' + i, verdict: 'NO PATCH FILE', passed: '0/30' });
    continue;
  }

  let patchContent = fs.readFileSync(patchFile, 'utf8').replace(/\r\n/g, '\n');
  const tmpPatch = path.join(ZOD_DIR, '_tmp.patch');
  fs.writeFileSync(tmpPatch, patchContent, 'utf8');

  try {
    execSync('git apply --whitespace=fix _tmp.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
  } catch (e) {
    if (fs.existsSync(tmpPatch)) fs.unlinkSync(tmpPatch);
    results.push({ agent: 'Nova #' + i, verdict: 'PATCH_APPLY_FAILED', passed: '0/30' });
    continue;
  }
  if (fs.existsSync(tmpPatch)) fs.unlinkSync(tmpPatch);

  try {
    execSync('git apply --whitespace=fix "' + TEST_PATCH + '"', { cwd: ZOD_DIR, stdio: 'pipe' });
  } catch (e) {
    results.push({ agent: 'Nova #' + i, verdict: 'TEST_APPLY_FAILED', passed: '0/30' });
    continue;
  }

  try {
    const out = execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', {
      cwd: ZOD_DIR,
      stdio: 'pipe',
      timeout: 60000
    }).toString('utf8');

    results.push({ agent: 'Nova #' + i, verdict: 'SOLVED (PASS)', passed: '30/30' });
  } catch (err) {
    const out = (err.stdout ? err.stdout.toString('utf8') : '') + (err.stderr ? err.stderr.toString('utf8') : '');
    const m = out.match(/Tests\s+(?:(\d+)\s+failed\s*\|\s*)?(\d+)\s+passed/);
    let passedCount = 0;
    if (m) {
      passedCount = parseInt(m[2] || '0', 10);
    }
    results.push({ agent: 'Nova #' + i, verdict: 'MISSED REQUIREMENT (FAIL)', passed: passedCount + '/30' });
  }
}

cleanRepo();

console.log('\n======================================================');
console.log('            FINAL NOVA AGENTS REPORT                  ');
console.log('======================================================');
console.table(results);

const novaResults = results.filter(r => r.agent.startsWith('Nova'));
const passedNova = novaResults.filter(r => r.verdict.includes('SOLVED'));
console.log(`Total Solving Agents: ${passedNova.length} / 13 (${((passedNova.length/13)*100).toFixed(1)}% pass rate)`);
console.log(`Passing Agent List: ${passedNova.map(a => a.agent).join(', ')}`);
console.log(`Reference Solution Status: ${results.find(r => r.agent === 'Reference Solution')?.verdict} (${results.find(r => r.agent === 'Reference Solution')?.passed})`);

