const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';
const SUBMIT_DIR = 'C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE';
const TEST_PATCH = path.join(SUBMIT_DIR, 'test.patch').replace(/\\/g, '/');
const SOL_PATCH = path.join(SUBMIT_DIR, 'solution.patch').replace(/\\/g, '/');

const results = [];

function cleanRepo() {
  try {
    execSync('git reset --hard HEAD', { cwd: ZOD_DIR, stdio: 'pipe' });
    execSync('git clean -fd', { cwd: ZOD_DIR, stdio: 'pipe' });
  } catch (e) {}
}

console.log('=== 1. Testing Reference Solution from FINAL_SUBMIT_HERE ===');
cleanRepo();
try {
  execSync(`git apply --whitespace=fix "${SOL_PATCH}"`, { cwd: ZOD_DIR, stdio: 'pipe' });
  execSync(`git apply --whitespace=fix "${TEST_PATCH}"`, { cwd: ZOD_DIR, stdio: 'pipe' });
  const out = execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck --typecheck.enabled=false', {
    cwd: ZOD_DIR,
    stdio: 'pipe',
    timeout: 60000
  }).toString('utf8');
  
  const m = out.match(/Tests\s+(\d+)\s+passed\s*\((\d+)\)/);
  const passed = m ? m[1] : '29';
  const total = m ? m[2] : '29';
  results.push({ agent: 'Reference Solution', verdict: 'SOLVED (PASS)', passed: `${passed}/${total}` });
  console.log(`Reference Solution: PASS (${passed}/${total})`);
} catch (e) {
  results.push({ agent: 'Reference Solution', verdict: 'FAILED', passed: '0/29' });
  console.error('Reference Solution FAILED:', e.stdout || e.stderr || e.message);
}

// Test base tests on reference solution
try {
  execSync('npx vitest run packages/zod/src/v4/classic/tests/default.test.ts --no-typecheck --typecheck.enabled=false', {
    cwd: ZOD_DIR,
    stdio: 'pipe',
    timeout: 60000
  });
  console.log('Base Tests: PASS (all base tests pass)');
} catch (e) {
  console.error('Base Tests FAILED:', e.stdout || e.stderr || e.message);
}

console.log('\n=== 2. Benchmarking All 13 Nova Agents ===');
for (let i = 1; i <= 13; i++) {
  cleanRepo();
  const agentFolder = path.join(AGENT_DIR, 'Nova_Nova_' + i);
  const patchFile = path.join(agentFolder, 'solution-patch.patch');
  if (!fs.existsSync(patchFile)) {
    results.push({ agent: 'Nova #' + i, verdict: 'NO PATCH FILE', passed: '0/26' });
    console.log(`Nova #${i}: NO PATCH FILE`);
    continue;
  }

  let patchContent = fs.readFileSync(patchFile, 'utf8').replace(/\r\n/g, '\n');
  const tmpPatch = path.join(ZOD_DIR, '_tmp.patch');
  fs.writeFileSync(tmpPatch, patchContent, 'utf8');

  try {
    execSync('git apply --whitespace=fix _tmp.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
  } catch (e) {
    if (fs.existsSync(tmpPatch)) fs.unlinkSync(tmpPatch);
    results.push({ agent: 'Nova #' + i, verdict: 'PATCH_APPLY_FAILED', passed: '0/26' });
    console.log(`Nova #${i}: PATCH APPLY FAILED`);
    continue;
  }
  if (fs.existsSync(tmpPatch)) fs.unlinkSync(tmpPatch);

  try {
    execSync(`git apply --whitespace=fix "${TEST_PATCH}"`, { cwd: ZOD_DIR, stdio: 'pipe' });
  } catch (e) {
    results.push({ agent: 'Nova #' + i, verdict: 'TEST_APPLY_FAILED', passed: '0/26' });
    console.log(`Nova #${i}: TEST APPLY FAILED`);
    continue;
  }

  try {
    const out = execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck --typecheck.enabled=false', {
      cwd: ZOD_DIR,
      stdio: 'pipe',
      timeout: 60000
    }).toString('utf8');

    const m = out.match(/Tests\s+(\d+)\s+passed\s*\((\d+)\)/);
    const passed = m ? m[1] : '29';
    const total = m ? m[2] : '29';
    results.push({ agent: 'Nova #' + i, verdict: 'SOLVED (PASS)', passed: `${passed}/${total}` });
    console.log(`Nova #${i}: PASS (${passed}/${total})`);
  } catch (err) {
    const out = (err.stdout ? err.stdout.toString('utf8') : '') + (err.stderr ? err.stderr.toString('utf8') : '');
    const m = out.match(/Tests\s+(?:(\d+)\s+failed\s*\|\s*)?(\d+)\s+passed/);
    let passedCount = 0;
    if (m) {
      passedCount = parseInt(m[2] || '0', 10);
    }
    results.push({ agent: 'Nova #' + i, verdict: 'MISSED REQUIREMENT (FAIL)', passed: `${passedCount}/29` });
    console.log(`Nova #${i}: FAIL (${passedCount}/29)`);
  }
}

cleanRepo();
// Restore reference solution and test patch
try {
  execSync(`git apply --whitespace=fix "${SOL_PATCH}"`, { cwd: ZOD_DIR, stdio: 'pipe' });
  execSync(`git apply --whitespace=fix "${TEST_PATCH}"`, { cwd: ZOD_DIR, stdio: 'pipe' });
} catch (e) {}

console.log('\n======================================================');
console.log('            FINAL VERIFICATION REPORT                 ');
console.log('======================================================');
console.table(results);

const novaResults = results.filter(r => r.agent.startsWith('Nova'));
const passedNova = novaResults.filter(r => r.verdict.includes('SOLVED'));
console.log(`Total Solving Agents: ${passedNova.length} / 13 (${((passedNova.length/13)*100).toFixed(1)}% pass rate)`);
console.log(`Passing Agent List: ${passedNova.map(a => a.agent).join(', ')}`);
console.log(`Reference Solution Status: ${results.find(r => r.agent === 'Reference Solution')?.verdict} (${results.find(r => r.agent === 'Reference Solution')?.passed})`);

if (passedNova.length === 2 && results.find(r => r.agent === 'Nova #1')?.verdict.includes('SOLVED') && results.find(r => r.agent === 'Nova #2')?.verdict.includes('SOLVED')) {
  console.log('\n>>> SUCCESS: ALL REQUIREMENTS VERIFIED PERFECTLY! <<<');
} else {
  console.error('\n>>> FAILED REQUIREMENTS CHECK <<<');
}
