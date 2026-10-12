const { execSync } = require('child_process');
const fs = require('fs');

const agents = Array.from({length: 13}, (_, i) => i + 1);

console.log("=== FINAL EVALUATION: All 13 agents vs CALIBRATED_TEST_PATCH_2PASS.patch ===\n");

const results = [];

for (const a of agents) {
  try {
    execSync('git reset --hard HEAD', {cwd: 'C:/Users/USER/OneDrive/Desktop/MAA/zod', stdio: 'ignore'});
    execSync('git clean -fd', {cwd: 'C:/Users/USER/OneDrive/Desktop/MAA/zod', stdio: 'ignore'});
    
    // Apply calibrated test patch first
    try {
      execSync('git apply --recount "C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CALIBRATED_TEST_PATCH_2PASS.patch"', {cwd: 'C:/Users/USER/OneDrive/Desktop/MAA/zod', stdio: 'ignore'});
    } catch(e) {
      console.log(`Agent ${a}: ERROR applying test patch`);
      results.push({agent: a, passed: 0, failed: 0, error: 'test patch failed'});
      continue;
    }
    
    // Apply agent solution
    try {
      execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-NEW/Nova_Nova_${a}/solution-patch.patch"`, {cwd: 'C:/Users/USER/OneDrive/Desktop/MAA/zod', stdio: 'ignore'});
    } catch(e) {
      console.log(`Agent ${a}: ERROR applying solution patch`);
      results.push({agent: a, passed: 0, failed: 0, error: 'solution patch failed'});
      continue;
    }
    
    // Run tests and capture all output
    let rawOutput = '';
    try {
      rawOutput = execSync(
        'pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false',
        {cwd: 'C:/Users/USER/OneDrive/Desktop/MAA/zod', encoding: 'utf8', timeout: 120000, stdio: ['pipe', 'pipe', 'pipe']}
      );
    } catch(e) {
      rawOutput = (e.stdout || '') + (e.stderr || '');
    }
    
    // Parse "Tests  X failed | Y passed"
    const testLineMatch = rawOutput.match(/Tests\s+(\d+) failed \| (\d+) passed/);
    if (testLineMatch) {
      const failed = parseInt(testLineMatch[1]);
      const passed = parseInt(testLineMatch[2]);
      console.log(`Agent ${a}: PASS=${passed}, FAIL=${failed}`);
      results.push({agent: a, passed, failed});
    } else {
      // Try "Tests  X passed"
      const passOnlyMatch = rawOutput.match(/Tests\s+(\d+) passed/);
      if (passOnlyMatch) {
        const passed = parseInt(passOnlyMatch[1]);
        console.log(`Agent ${a}: PASS=${passed}, FAIL=0 (ALL PASS!)`);
        results.push({agent: a, passed, failed: 0});
      } else {
        // Count individual test results
        const passCount = (rawOutput.match(/✓|×/g) || []).filter(x => x === '✓').length;
        const failCount = (rawOutput.match(/✓|×/g) || []).filter(x => x === '×').length;
        console.log(`Agent ${a}: PASS=${passCount}, FAIL=${failCount} (via counting)`);
        results.push({agent: a, passed: passCount, failed: failCount});
      }
    }
  } catch(e) {
    console.log(`Agent ${a}: ERROR - ${e.message.substring(0, 100)}`);
    results.push({agent: a, passed: 0, failed: 0, error: e.message.substring(0, 100)});
  }
}

console.log("\n=== FINAL SUMMARY (sorted by passed count) ===");
results.sort((a, b) => b.passed - a.passed);
results.forEach(r => {
  const bar = '█'.repeat(Math.floor(r.passed / 2));
  console.log(`Agent ${String(r.agent).padStart(2)}: ${String(r.passed).padStart(3)} passed, ${String(r.failed).padStart(3)} failed  ${bar}${r.error ? ' (ERROR: ' + r.error + ')' : ''}`);
});
