const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const zodDir = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const testPatch = 'C:/Users/USER/OneDrive/Desktop/MAA/1_UPLOAD_THIS_AS_TEST_PATCH/test.patch';
const solPatch = 'C:/Users/USER/OneDrive/Desktop/MAA/2_UPLOAD_THIS_AS_SOLUTION_PATCH/solution.patch';
const agentRunsDir = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';

function resetGit() {
  execSync('git reset --hard HEAD', { cwd: zodDir, stdio: 'ignore' });
  execSync('git clean -fd', { cwd: zodDir, stdio: 'ignore' });
}

console.log('====================================================');
console.log('VERIFYING SUBMISSION ARTIFACTS LOCALLY');
console.log('====================================================\n');

// 1. Base + Test Patch (F2P - Fail to Pass)
console.log('--- 1. CHECK F2P (Base repo + test.patch) ---');
resetGit();
execSync(`git apply "${testPatch}"`, { cwd: zodDir });
let f2pResult = '';
try {
  f2pResult = execSync('pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false', {
    cwd: zodDir,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  console.log('UNEXPECTED: Base passed!');
} catch (err) {
  const output = (err.stdout || '') + (err.stderr || '');
  const match = output.match(/Tests\s+(.*?)\n/);
  console.log('F2P Result: Tests FAILED as expected on unpatched base.');
  if (match) console.log('  Summary:', match[0].trim());
  const passMatch = output.match(/(\d+) passed/);
  const failMatch = output.match(/(\d+) failed/);
  console.log(`  Passed: ${passMatch ? passMatch[1] : 0}, Failed: ${failMatch ? failMatch[1] : 'all'}`);
}

// 2. Base + Test Patch + Solution Patch (Reference Solution)
console.log('\n--- 2. CHECK REFERENCE SOLUTION (test.patch + solution.patch) ---');
resetGit();
execSync(`git apply "${testPatch}"`, { cwd: zodDir });
execSync(`git apply "${solPatch}"`, { cwd: zodDir });
try {
  const solOutput = execSync('pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false', {
    cwd: zodDir,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  const match = solOutput.match(/Tests\s+(.*?)\n/);
  console.log('Reference Solution Result: PASSED 100%!');
  if (match) console.log('  Summary:', match[0].trim());
} catch (err) {
  console.log('FAILED on reference solution:');
  console.log((err.stdout || '') + (err.stderr || ''));
}

// 3. Base + Solution Patch (P2P - Regression Check)
console.log('\n--- 3. CHECK P2P REGRESSION (solution.patch on existing classic tests) ---');
resetGit();
execSync(`git apply "${solPatch}"`, { cwd: zodDir });
try {
  const p2pOutput = execSync('pnpm vitest run packages/zod/src/v4/classic/tests/default.test.ts --typecheck.enabled=false', {
    cwd: zodDir,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  const match = p2pOutput.match(/Tests\s+(.*?)\n/);
  console.log('P2P Regression Result: 0 REGRESSIONS!');
  if (match) console.log('  Summary:', match[0].trim());
} catch (err) {
  console.log('P2P Regressions detected:');
  console.log((err.stdout || '') + (err.stderr || ''));
}

// 4. Nova Agent Benchmarks (1 through 13)
console.log('\n--- 4. CHECK NOVA BENCHMARK (13 Nova Agents against test.patch) ---');
const agentResults = [];
for (let i = 1; i <= 13; i++) {
  resetGit();
  execSync(`git apply "${testPatch}"`, { cwd: zodDir });
  const agentPatch = path.join(agentRunsDir, `Nova_Nova_${i}`, 'solution-patch.patch');
  if (!fs.existsSync(agentPatch)) {
    console.log(`Nova #${i}: patch not found at ${agentPatch}`);
    continue;
  }
  try {
    execSync(`git apply --recount "${agentPatch}"`, { cwd: zodDir, stdio: 'ignore' });
  } catch (e) {
    agentResults.push({ agent: i, status: 'GIT_APPLY_FAILED', passed: 0, failed: 'N/A' });
    console.log(`Nova #${i}: git apply failed`);
    continue;
  }

  try {
    const rawOut = execSync('pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false', {
      cwd: zodDir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const match = rawOut.match(/Tests\s+(\d+)\s+passed/);
    const passCount = match ? parseInt(match[1]) : 30;
    agentResults.push({ agent: i, status: 'PASSED', passed: passCount, failed: 0 });
    console.log(`Nova #${i}: ✅ PASSED (${passCount}/30)`);
  } catch (err) {
    const out = (err.stdout || '') + (err.stderr || '');
    const failMatch = out.match(/(\d+)\s+failed/);
    const passMatch = out.match(/(\d+)\s+passed/);
    const passed = passMatch ? parseInt(passMatch[1]) : 0;
    const failed = failMatch ? parseInt(failMatch[1]) : 30;
    agentResults.push({ agent: i, status: 'FAILED', passed, failed });
    console.log(`Nova #${i}: ❌ FAILED (${passed} passed, ${failed} failed)`);
  }
}

resetGit();

const passedAgents = agentResults.filter(r => r.status === 'PASSED');
console.log('\n====================================================');
console.log(`BENCHMARK SUMMARY: ${passedAgents.length}/13 Nova agents passed (${(passedAgents.length/13*100).toFixed(1)}% solve rate)`);
console.log(`Passing agents: ${passedAgents.map(a => 'Nova #' + a.agent).join(', ')}`);
console.log('====================================================');
