const { execSync } = require('child_process');
const zodDir = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const testPatch = 'C:/Users/USER/OneDrive/Desktop/MAA/scratch/calibrated_test.patch';
const agentPatch = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_1/solution-patch.patch';

execSync('git reset --hard HEAD', { cwd: zodDir, stdio: 'ignore' });
execSync('git clean -fd', { cwd: zodDir, stdio: 'ignore' });
execSync(`git apply "${testPatch}"`, { cwd: zodDir });
execSync(`git apply --recount "${agentPatch}"`, { cwd: zodDir });

try {
  const out = execSync('pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false', {
    cwd: zodDir,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  console.log('Nova 1 passed all');
} catch (e) {
  const out = (e.stdout || '') + (e.stderr || '');
  console.log(out.split('\n').filter(l => l.includes('FAIL') || l.includes('×') || l.includes('AssertionError')).slice(0, 15).join('\n'));
}
