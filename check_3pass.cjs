const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const zodDir = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const agentsDir = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-3RAMRAM';

const testContent = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/scratch/baseline_423.ts', 'utf8') + '\n\n' + fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/scratch/new_tests_reduced.ts', 'utf8');
const testDest = path.join(zodDir, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts');

function disableTypecheck() {
  ['vitest.config.ts', 'packages/zod/vitest.config.ts'].forEach(f => {
    const full = path.join(zodDir, f);
    if (fs.existsSync(full)) {
      let content = fs.readFileSync(full, 'utf8');
      content = content.replace(/enabled:\s*true/g, 'enabled: false');
      fs.writeFileSync(full, content, 'utf8');
    }
  });
}

const targetAgents = ['Nova_Nova_11', 'Nova_Nova_19', 'Nova_Nova_32'];

for (const agent of targetAgents) {
  cp.execSync('git reset HEAD --hard', { cwd: zodDir, stdio: 'ignore' });
  cp.execSync('git clean -fd', { cwd: zodDir, stdio: 'ignore' });
  cp.execSync('git checkout 1fb56a5c', { cwd: zodDir, stdio: 'ignore' });

  disableTypecheck();
  fs.writeFileSync(testDest, testContent, 'utf8');

  cp.execSync('git apply ' + path.join(agentsDir, agent, 'solution-patch.patch'), { cwd: zodDir, stdio: 'ignore' });

  try {
    cp.execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts --no-typecheck', { cwd: zodDir, stdio: 'ignore' });
    console.log(`${agent}: PASS`);
  } catch (e) {
    console.log(`${agent}: FAIL`);
  }
}

// Check our solution
cp.execSync('git reset HEAD --hard', { cwd: zodDir, stdio: 'ignore' });
cp.execSync('git clean -fd', { cwd: zodDir, stdio: 'ignore' });
cp.execSync('git checkout 1fb56a5c', { cwd: zodDir, stdio: 'ignore' });

disableTypecheck();
cp.execSync('git apply C:/Users/USER/OneDrive/Desktop/MAA/CLEAN_SOLUTION_FINAL.patch', { cwd: zodDir, stdio: 'ignore' });
fs.writeFileSync(testDest, testContent, 'utf8');

try {
  cp.execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts --no-typecheck', { cwd: zodDir, stdio: 'ignore' });
  console.log(`CLEAN_SOLUTION_FINAL: PASS`);
} catch (e) {
  console.log(`CLEAN_SOLUTION_FINAL: FAIL`);
}
