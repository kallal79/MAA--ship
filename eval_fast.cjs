const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const agentsDir = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-3RAMRAM';
const zodDir = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const testFileSource = 'C:/Users/USER/.gemini/antigravity-ide/brain/2fabeeec-d12f-4941-bbf9-ce939f4abe27/patch_dir/encode-defaults.8a4f9b.test.final.ts';
const testFileContent = fs.readFileSync(testFileSource, 'utf8');

const agents = fs.readdirSync(agentsDir).filter(f => f.startsWith('Nova_Nova_'));
let passed = 0;
let failed = 0;
let results = {};

async function runTest(agent) {
  const agentPatch = path.join(agentsDir, agent, 'solution-patch.patch');
  if (!fs.existsSync(agentPatch)) return;

  console.log('Evaluating ' + agent + '...');
  
  // Clean and reset zod
  cp.execSync('git clean -fd && git reset HEAD --hard', {cwd: zodDir, stdio: 'ignore'});
  cp.execSync('git checkout 1fb56a5c', {cwd: zodDir, stdio: 'ignore'});
  cp.execSync('node -e "const fs=require(\'fs\'); [\'vitest.config.ts\', \'packages/zod/vitest.config.ts\'].forEach(f => { if(fs.existsSync(f)) { fs.writeFileSync(f, fs.readFileSync(f, \'utf8\').replace(/enabled:\\s*true/g, \'enabled: false\')); } });"', {cwd: zodDir, stdio: 'ignore'});
  
  // Apply agent patch
  try {
    cp.execSync('git apply "' + agentPatch + '"', {cwd: zodDir, stdio: 'ignore'});
  } catch (e) {
    try {
        cp.execSync('git apply --ignore-whitespace "' + agentPatch + '"', {cwd: zodDir, stdio: 'ignore'});
    } catch(e2) {
        console.log('  Failed to apply patch');
        failed++;
        results[agent] = 'PATCH_FAIL';
        return;
    }
  }
  
  // Write test file
  const testDest = path.join(zodDir, 'packages/zod/src/v4/classic/tests/encode-defaults.test.ts');
  fs.writeFileSync(testDest, testFileContent);
  
  return new Promise((resolve) => {
    const child = cp.exec('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.test.ts --no-typecheck', {cwd: zodDir});
    
    let timer = setTimeout(() => {
      console.log('  TIMEOUT');
      cp.execSync('taskkill /pid ' + child.pid + ' /T /F', {stdio: 'ignore'});
      failed++;
      results[agent] = 'TIMEOUT';
      resolve();
    }, 25000); // 25 seconds timeout

    child.on('exit', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        console.log('  PASS');
        passed++;
        results[agent] = 'PASS';
      } else {
        console.log('  FAIL');
        failed++;
        results[agent] = 'FAIL';
      }
      resolve();
    });
  });
}

async function main() {
  for (const agent of agents) {
    await runTest(agent);
  }
  console.log('Total Pass: ' + passed);
  console.log('Total Fail: ' + failed);
  fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/zod/eval_results.json', JSON.stringify(results, null, 2));
}

main();
