const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';

function testAgent(agentId, specContent) {
  execSync('git reset --hard HEAD', { cwd: ZOD_DIR, stdio: 'pipe' });
  execSync('git clean -fd', { cwd: ZOD_DIR, stdio: 'pipe' });

  if (agentId === 'solution') {
    execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/solution.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
  } else {
    const p = path.join(AGENT_DIR, 'Nova_Nova_' + agentId, 'solution-patch.patch');
    let txt = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
    const tmp = path.join(ZOD_DIR, '_tmp.patch');
    fs.writeFileSync(tmp, txt, 'utf8');
    try {
      execSync('git apply --whitespace=fix _tmp.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
    } catch (e) {
      fs.unlinkSync(tmp);
      return false;
    }
    fs.unlinkSync(tmp);
  }

  const specPath = path.join(ZOD_DIR, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts');
  fs.writeFileSync(specPath, specContent, 'utf8');

  try {
    execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', {
      cwd: ZOD_DIR,
      stdio: 'pipe',
      timeout: 30000
    });
    return true;
  } catch (e) {
    return false;
  }
}

// Let's inspect which specific tests discriminate Nova #4, #5 vs #6, #7, #9, #12
// Let's test individual agent diffs to find unique features
const specBase = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH_100_PERCENT.patch', 'utf8');
console.log('Testing agents on candidate configurations...');
