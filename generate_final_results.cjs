const { execSync } = require('child_process');
const fs = require('fs');

const agents = Array.from({length: 13}, (_, i) => i + 1);

let md = "# Final Calibration Results: All 13 Nova Agents\n\n";
md += "These results represent the local test runs of all 13 Nova agents against the final calibrated test patch (`CALIBRATED_TEST_PATCH_2PASS.patch`).\n\n";
md += "| Agent | Status | Tests Passed | Tests Failed | Notes |\n";
md += "|---|---|---|---|---|\n";

const results = [];

for (const a of agents) {
  try {
    execSync('git reset --hard HEAD', {cwd: 'C:/Users/USER/OneDrive/Desktop/MAA/zod', stdio: 'ignore'});
    execSync('git clean -fd', {cwd: 'C:/Users/USER/OneDrive/Desktop/MAA/zod', stdio: 'ignore'});
    
    // Apply calibrated test patch
    execSync('git apply --recount "C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CALIBRATED_TEST_PATCH_2PASS.patch"', {cwd: 'C:/Users/USER/OneDrive/Desktop/MAA/zod', stdio: 'ignore'});
    
    // Apply agent solution
    let solutionPatchPath = `C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-NEW/Nova_Nova_${a}/solution-patch.patch`;
    execSync(`git apply --recount "${solutionPatchPath}"`, {cwd: 'C:/Users/USER/OneDrive/Desktop/MAA/zod', stdio: 'ignore'});
    
    // Run tests
    let rawOutput = '';
    try {
      rawOutput = execSync(
        'pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false',
        {cwd: 'C:/Users/USER/OneDrive/Desktop/MAA/zod', encoding: 'utf8', timeout: 120000, stdio: ['pipe', 'pipe', 'pipe']}
      );
    } catch(e) {
      rawOutput = (e.stdout || '') + (e.stderr || '');
    }
    
    let passed = 0;
    let failed = 0;
    
    // Parse vitest output more accurately
    const testLineMatch = rawOutput.match(/Tests\s+(\d+) failed \| (\d+) passed/);
    if (testLineMatch) {
      failed = parseInt(testLineMatch[1]);
      passed = parseInt(testLineMatch[2]);
    } else {
      const passOnlyMatch = rawOutput.match(/Tests\\s+(\\d+) passed \\(\\d+\\)/);
      if (passOnlyMatch) {
        passed = parseInt(passOnlyMatch[1]);
        failed = 0;
      } else {
        passed = (rawOutput.match(/✓/g) || []).length;
        failed = (rawOutput.match(/×|FAIL/g) || []).length;
      }
    }
    
    results.push({agent: a, passed, failed});
    console.log(`Agent ${a}: PASS=${passed}, FAIL=${failed}`);
  } catch(e) {
    console.log(`Agent ${a} Error: ${e.message}`);
    results.push({agent: a, passed: 0, failed: 'ERROR'});
  }
}

// Sort by passed desc
results.sort((a, b) => {
  if (a.passed === b.passed) return a.agent - b.agent;
  return b.passed - a.passed;
});

for (const r of results) {
  let status = "❌ FAILED";
  if (r.failed === 0) status = "✅ PASSED (Target)";
  let notes = r.failed === 0 ? "Successfully passes all edge cases." : `Fails ${r.failed} calibrated test cases.`;
  md += `| Agent ${r.agent} | ${status} | ${r.passed} | ${r.failed} | ${notes} |\n`;
}

fs.writeFileSync('C:/Users/USER/.gemini/antigravity-ide/brain/f2af7cbb-923b-42de-9188-409966b47723/final_agent_results.md', md);
console.log("Done generating markdown artifact.");
