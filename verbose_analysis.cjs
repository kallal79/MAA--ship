const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const newAgentDir = "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-NEW";
const repoDir = "C:/Users/USER/OneDrive/Desktop/MAA/zod";
const testPatch = "C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH_100_PERCENT.patch";

// Test a single agent and capture per-test results
function testAgentVerbose(agentNum) {
  const agentPatch = path.join(newAgentDir, `Nova_Nova_${agentNum}`, 'solution-patch.patch');
  
  try {
    execSync('git reset --hard HEAD', { cwd: repoDir, stdio: 'ignore' });
    execSync('git clean -fd', { cwd: repoDir, stdio: 'ignore' });
    execSync(`git apply "${agentPatch}"`, { cwd: repoDir, stdio: 'ignore' });
    execSync(`git apply "${testPatch}"`, { cwd: repoDir, stdio: 'ignore' });
    
    try {
      const out = execSync('pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false', {
        cwd: repoDir, encoding: 'utf8', timeout: 60000, stderr: 'pipe'
      });
      const lines = out.split('\n').filter(l => l.trim().match(/^[✓×x✗]/));
      const passed = lines.filter(l => l.includes('✓')).length;
      const failed = lines.filter(l => l.match(/[×x✗]/)).length;
      return `Agent ${agentNum}: ✅ ALL PASS (${passed} passed)`;
    } catch (e) {
      const out = (e.stdout || '') + (e.stderr || '');
      // Extract pass/fail summary
      const summaryMatch = out.match(/Tests\s+(\d+) failed \| (\d+) passed/);
      const failedTests = [];
      const lines = out.split('\n');
      for (const line of lines) {
        if (line.match(/^\s+[×x✗]\s/) || line.includes(' × ') || line.includes(' x ')) {
          failedTests.push(line.trim().substring(0, 80));
        }
      }
      const summary = summaryMatch ? `${summaryMatch[1]} failed | ${summaryMatch[2]} passed` : 'unknown';
      return `Agent ${agentNum}: ❌ FAIL [${summary}]\n   Failed: ${failedTests.slice(0,6).join('\n   ')}`;
    }
  } catch (e) {
    return `Agent ${agentNum}: ❌ PATCH ERROR`;
  }
}

// Test specific agents to understand failures
const agentsToTest = [1, 5, 8, 10, 11, 13];
console.log("=== VERBOSE ANALYSIS ===\n");
for (const a of agentsToTest) {
  console.log(testAgentVerbose(a));
  console.log();
}
