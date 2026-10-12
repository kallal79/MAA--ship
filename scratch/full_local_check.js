const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';
const TEST_PATCH = 'C:/Users/USER/OneDrive/Desktop/MAA/1_UPLOAD_THIS_AS_TEST_PATCH/test.patch';
const SOL_PATCH  = 'C:/Users/USER/OneDrive/Desktop/MAA/2_UPLOAD_THIS_AS_SOLUTION_PATCH/solution.patch';
const SPEC  = 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts';
const BASE  = 'packages/zod/src/v4/classic/tests/default.test.ts';

const EXPECTED_TEST_COUNT = 30;

function cleanRepo() {
  try { execSync('git reset --hard HEAD', { cwd: ZOD_DIR, stdio: 'pipe' }); } catch(e) {}
  try { execSync('git clean -fd', { cwd: ZOD_DIR, stdio: 'pipe' }); } catch(e) {}
}

function applyPatch(patchPath, label) {
  try {
    execSync(`git apply --whitespace=fix "${patchPath}"`, { cwd: ZOD_DIR, stdio: 'pipe' });
    return true;
  } catch(e) {
    const msg = e.stderr ? e.stderr.toString('utf8') : e.message;
    console.log(`  [${label}] PATCH APPLY FAILED: ${msg.substring(0, 200)}`);
    return false;
  }
}

function runVitest(specFile) {
  const specFull = path.join(ZOD_DIR, specFile);
  if (!fs.existsSync(specFull)) {
    return { passed: 0, failed: EXPECTED_TEST_COUNT, total: EXPECTED_TEST_COUNT, error: 'SPEC_FILE_NOT_FOUND' };
  }

  const tmpName = `_vtest_tmp_${Math.floor(Math.random() * 100000)}.txt`;
  const tmpFile = path.join(ZOD_DIR, tmpName);

  try {
    execSync(`cmd /c npx vitest run ${specFile} --no-typecheck --typecheck.enabled=false > ${tmpName} 2>&1`, {
      cwd: ZOD_DIR, timeout: 60000
    });
  } catch(e) { /* non-zero exit is expected when tests fail */ }

  let out = '';
  if (fs.existsSync(tmpFile)) {
    try {
      out = fs.readFileSync(tmpFile, 'utf8');
      fs.unlinkSync(tmpFile);
    } catch(e) {}
  }

  // Strip ANSI codes
  out = out.replace(/\u001b\[[0-9;]*m/g, '');

  const mFail = out.match(/Tests\s+(\d+)\s+failed\s*\|\s*(\d+)\s+passed\s*\((\d+)\)/);
  if (mFail) {
    const failed = parseInt(mFail[1]);
    const passed = parseInt(mFail[2]);
    const total  = parseInt(mFail[3]);
    return { passed, failed, total, success: false };
  }

  const mPass = out.match(/Tests\s+(\d+)\s+passed\s*\((\d+)\)/);
  if (mPass) {
    const passed = parseInt(mPass[1]);
    const total  = parseInt(mPass[2]);
    return { passed, failed: total - passed, total, success: true };
  }

  return { passed: 0, failed: EXPECTED_TEST_COUNT, total: EXPECTED_TEST_COUNT, error: 'NO_MATCH', rawOut: out.substring(0, 300) };
}

console.log('');
console.log('========================================');
console.log('  FULL LOCAL VERIFICATION - ALL CHECKS  ');
console.log('========================================');
console.log('');

// ── CHECK 1: F2P (no solution) ───────────────────────────────────────────────
console.log('CHECK 1: Fail-to-Pass (F2P) Compliance');
console.log(`  All ${EXPECTED_TEST_COUNT} new tests must FAIL on base repo (no solution.patch)...`);
cleanRepo();
applyPatch(TEST_PATCH, 'test');
const f2p = runVitest(SPEC);
const f2pOk = f2p.passed === 0 && f2p.failed === EXPECTED_TEST_COUNT;
console.log(`  Result: ${f2p.passed} passed / ${f2p.failed} failed out of ${f2p.total}`);
if (f2p.error) console.log(`  Debug: ${f2p.error}`, f2p.rawOut || '');
console.log(`  Status: ${f2pOk ? `✅ PASS - All ${EXPECTED_TEST_COUNT} tests correctly FAIL without solution` : '❌ FAIL - Some tests unexpectedly pass!'}`);
console.log('');

// ── CHECK 2: Reference Solution passes all tests ───────────────────────────────
console.log(`CHECK 2: Reference Solution (solution.patch + test.patch) - All ${EXPECTED_TEST_COUNT} Must PASS`);
cleanRepo();
applyPatch(SOL_PATCH, 'sol');
applyPatch(TEST_PATCH, 'test');
const ref = runVitest(SPEC);
const refOk = ref.passed === EXPECTED_TEST_COUNT && ref.failed === 0;
console.log(`  Result: ${ref.passed} passed / ${ref.failed} failed out of ${ref.total}`);
if (ref.error) console.log(`  Debug: ${ref.error}`, ref.rawOut || '');
console.log(`  Status: ${refOk ? `✅ PASS - Reference solution passes all ${EXPECTED_TEST_COUNT} tests` : '❌ FAIL - Reference solution does not pass all tests!'}`);
console.log('');

// ── CHECK 3: No regression in base tests ────────────────────────────────────
console.log('CHECK 3: Base Default Tests (P2P) - Must all PASS with solution');
cleanRepo();
applyPatch(SOL_PATCH, 'sol');
const base = runVitest(BASE);
const baseOk = base.passed >= 20 && base.failed === 0;
console.log(`  Result: ${base.passed} passed / ${base.failed} failed out of ${base.total}`);
if (base.error) console.log(`  Debug: ${base.error}`, base.rawOut || '');
console.log(`  Status: ${baseOk ? '✅ PASS - No regressions in existing tests' : '❌ FAIL - Regressions detected!'}`);
console.log('');

// ── CHECK 4: Nova agent benchmark ───────────────────────────────────────────
console.log('CHECK 4: Nova Agent Benchmark (13 agents)');
console.log('  Testing each agent one by one...');
console.log('');

const agentResults = [];

for (let i = 1; i <= 13; i++) {
  cleanRepo();
  const agentPatch = path.join(AGENT_DIR, 'Nova_Nova_' + i, 'solution-patch.patch');

  if (!fs.existsSync(agentPatch)) {
    agentResults.push({ agent: i, status: 'NO_PATCH', passed: 0, failed: EXPECTED_TEST_COUNT });
    console.log(`  Nova #${i}: ❌ NO PATCH FILE`);
    continue;
  }

  // Write normalized agent patch to tmp
  const patchContent = fs.readFileSync(agentPatch, 'utf8').replace(/\r\n/g, '\n');
  const tmpPatch = path.join(ZOD_DIR, `_agent_tmp_${i}.patch`);
  fs.writeFileSync(tmpPatch, patchContent, 'utf8');

  let agentApplied = true;
  try {
    execSync(`git apply --whitespace=fix "_agent_tmp_${i}.patch"`, { cwd: ZOD_DIR, stdio: 'pipe' });
  } catch(e) {
    agentApplied = false;
  }
  if (fs.existsSync(tmpPatch)) try { fs.unlinkSync(tmpPatch); } catch(e) {}

  if (!agentApplied) {
    agentResults.push({ agent: i, status: 'PATCH_FAIL', passed: 0, failed: EXPECTED_TEST_COUNT });
    console.log(`  Nova #${i}: ❌ PATCH APPLY FAILED`);
    continue;
  }

  const testApplied = applyPatch(TEST_PATCH, `Nova#${i}/test`);
  if (!testApplied) {
    agentResults.push({ agent: i, status: 'TEST_APPLY_FAIL', passed: 0, failed: EXPECTED_TEST_COUNT });
    console.log(`  Nova #${i}: ❌ TEST PATCH APPLY FAILED`);
    continue;
  }

  const r = runVitest(SPEC);
  const pass = r.passed === EXPECTED_TEST_COUNT && r.failed === 0;
  agentResults.push({ agent: i, status: pass ? 'PASS' : 'FAIL', passed: r.passed, failed: r.failed });
  const icon = pass ? '✅ PASS' : '❌ FAIL';
  console.log(`  Nova #${String(i).padEnd(2)}: ${icon} (${r.passed}/${EXPECTED_TEST_COUNT} tests pass${r.error ? ' [' + r.error + ']' : ''})`);
}

cleanRepo();

// ── SUMMARY ──────────────────────────────────────────────────────────────────
const passes = agentResults.filter(r => r.status === 'PASS');
const fails  = agentResults.filter(r => r.status !== 'PASS');
const passRate = (passes.length / agentResults.length * 100).toFixed(1);

console.log('');
console.log('========================================');
console.log('        FINAL VERIFICATION REPORT       ');
console.log('========================================');
console.log('');
console.log(`CHECK 1 (F2P):          ${f2pOk  ? '✅ PASS' : '❌ FAIL'} - ${f2p.passed}/${EXPECTED_TEST_COUNT} pass on base unpatched (must be 0)`);
console.log(`CHECK 2 (Ref Solution): ${refOk  ? '✅ PASS' : '❌ FAIL'} - ${ref.passed}/${EXPECTED_TEST_COUNT} pass with solution (must be ${EXPECTED_TEST_COUNT})`);
console.log(`CHECK 3 (P2P):          ${baseOk ? '✅ PASS' : '❌ FAIL'} - ${base.passed}/20 base tests pass (must be ≥20)`);
console.log(`CHECK 4 (Nova Agents):  ${passes.length === 2 ? '✅ PASS' : '❌ FAIL'} - ${passes.length}/${agentResults.length} agents solve (${passRate}%)`);
console.log('');
console.log(`  ✅ Passing Agents: ${passes.map(p => 'Nova #' + p.agent).join(', ') || 'None'}`);
console.log(`  ❌ Failing Agents: ${fails.map(f => 'Nova #' + f.agent).join(', ')}`);
console.log('');

const allOk = f2pOk && refOk && baseOk && passes.length === 2;
console.log(allOk ? '>>> ALL CHECKS PASSED ✅ - READY TO SUBMIT <<<' : '>>> SOME CHECKS FAILED ❌ <<<');
console.log('');
console.log('Submit these 2 files:');
console.log('  SOLUTION: C:/Users/USER/OneDrive/Desktop/MAA/2_UPLOAD_THIS_AS_SOLUTION_PATCH/solution.patch');
console.log('  TEST:     C:/Users/USER/OneDrive/Desktop/MAA/1_UPLOAD_THIS_AS_TEST_PATCH/test.patch');
console.log('');
