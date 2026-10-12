const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';
const TEST_PATCH = 'C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/test.patch';

execSync('git reset --hard HEAD', { cwd: ZOD_DIR, stdio: 'pipe' });
execSync('git clean -fd', { cwd: ZOD_DIR, stdio: 'pipe' });
const patchPath = path.join(AGENT_DIR, 'Nova_Nova_5', 'solution-patch.patch');
const agentPatch = fs.readFileSync(patchPath, 'utf8').replace(/\r\n/g, '\n');
fs.writeFileSync(path.join(ZOD_DIR, '_tmp.patch'), agentPatch, 'utf8');
execSync('git apply --whitespace=fix _tmp.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
fs.unlinkSync(path.join(ZOD_DIR, '_tmp.patch'));
execSync('git apply --whitespace=fix "' + TEST_PATCH + '"', { cwd: ZOD_DIR, stdio: 'pipe' });

try {
  const out = execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', {
    cwd: ZOD_DIR,
    stdio: 'pipe',
    timeout: 60000
  }).toString('utf8');
  console.log('AGENT 5 SUCCESS:\n', out);
} catch (err) {
  console.log('AGENT 5 ERROR STDOUT:\n', err.stdout ? err.stdout.toString('utf8') : '');
  console.log('AGENT 5 ERROR STDERR:\n', err.stderr ? err.stderr.toString('utf8') : '');
}
