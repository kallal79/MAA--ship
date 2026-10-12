const fs = require('fs');
const cp = require('child_process');
const path = require('path');
const os = require('os');

const agentsDir = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-3RAMRAM';
const zodDir = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const testFileSource = 'C:/Users/USER/.gemini/antigravity-ide/brain/2fabeeec-d12f-4941-bbf9-ce939f4abe27/patch_dir/encode-defaults.8a4f9b.test.final.ts';
const testFileContent = fs.readFileSync(testFileSource, 'utf8');

// The tricky new tests to drop pass rate:
const newTests = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/scratch/new_tests.ts', 'utf8');
const finalTestContent = testFileContent + '\n' + newTests;

const agents = fs.readdirSync(agentsDir).filter(f => f.startsWith('Nova_Nova_'));
let passed = 0;
let failed = 0;
let results = {};
let activeCount = 0;
const MAX_CONCURRENT = 10;
const queue = [...agents];

async function runTest(agent) {
  const agentPatch = path.join(agentsDir, agent, 'solution-patch.patch');
  if (!fs.existsSync(agentPatch)) {
    results[agent] = 'NO_PATCH';
    return;
  }

  // Create a separate workspace clone for each agent to run in parallel
  const workDir = path.join(os.tmpdir(), 'zod_eval_' + agent);
  if (fs.existsSync(workDir)) {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
  
  // Quick clone
  cp.execSync(`git clone ${zodDir} ${workDir}`, { stdio: 'ignore' });
  
  // Checkout base commit
  cp.execSync('git checkout 1fb56a5c', { cwd: workDir, stdio: 'ignore' });
  
  // Apply patch
  try {
    cp.execSync('git apply "' + agentPatch + '"', { cwd: workDir, stdio: 'ignore' });
  } catch (e) {
    try {
        cp.execSync('git apply --ignore-whitespace "' + agentPatch + '"', { cwd: workDir, stdio: 'ignore' });
    } catch(e2) {
        results[agent] = 'PATCH_FAIL';
        failed++;
        fs.rmSync(workDir, { recursive: true, force: true });
        return;
    }
  }

  // Disable typecheck
  cp.execSync('node -e "const fs=require(\'fs\'); [\'vitest.config.ts\', \'packages/zod/vitest.config.ts\'].forEach(f => { if(fs.existsSync(f)) { fs.writeFileSync(f, fs.readFileSync(f, \'utf8\').replace(/enabled:\\\\s*true/g, \'enabled: false\')); } });"', { cwd: workDir, stdio: 'ignore' });

  // Write test
  const testDest = path.join(workDir, 'packages/zod/src/v4/classic/tests/encode-defaults.test.ts');
  fs.writeFileSync(testDest, finalTestContent, 'utf8');

  return new Promise((resolve) => {
    const child = cp.exec('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.test.ts --no-typecheck', { cwd: workDir });
    
    let isDone = false;
    let timer = setTimeout(() => {
      if (isDone) return;
      isDone = true;
      try { cp.execSync('taskkill /pid ' + child.pid + ' /T /F', { stdio: 'ignore' }); } catch(e) {}
      results[agent] = 'TIMEOUT';
      failed++;
      fs.rmSync(workDir, { recursive: true, force: true });
      resolve();
    }, 20000);

    child.on('exit', (code) => {
      if (isDone) return;
      isDone = true;
      clearTimeout(timer);
      if (code === 0) {
        results[agent] = 'PASS';
        passed++;
      } else {
        results[agent] = 'FAIL';
        failed++;
      }
      try {
        fs.rmSync(workDir, { recursive: true, force: true });
      } catch (e) {}
      resolve();
    });
  });
}

async function processQueue() {
  while (queue.length > 0) {
    const agent = queue.shift();
    console.log('Starting ' + agent);
    await runTest(agent);
    console.log('Finished ' + agent + ' -> ' + results[agent]);
  }
}

async function main() {
  const workers = [];
  for (let i = 0; i < MAX_CONCURRENT; i++) {
    workers.push(processQueue());
  }
  await Promise.all(workers);
  
  console.log('Total Pass: ' + passed);
  console.log('Total Fail: ' + failed);
  fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/zod/eval_results.json', JSON.stringify(results, null, 2));
}

main();
