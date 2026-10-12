const fs = require('fs');
const cp = require('child_process');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const agentsDir = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-3RAMRAM';
const zodDir = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const testPatch = 'C:/Users/USER/OneDrive/Desktop/MAA/1_UPLOAD_THIS_AS_TEST_PATCH/test.patch';

const agents = fs.readdirSync(agentsDir).filter(f => f.startsWith('Nova_Nova_'));
let passed = 0;
let failed = 0;
let results = {};
const MAX_CONCURRENT = 10;
const queue = [...agents];

agents.sort((a, b) => {
  const numA = parseInt(a.replace('Nova_Nova_', ''), 10);
  const numB = parseInt(b.replace('Nova_Nova_', ''), 10);
  return numA - numB;
});

async function runTest(agent) {
  const agentPatch = path.join(agentsDir, agent, 'solution-patch.patch');
  if (!fs.existsSync(agentPatch)) {
    results[agent] = 'NO_PATCH';
    return;
  }

  const workDir = path.join(os.tmpdir(), 'zod_eval_' + crypto.randomBytes(4).toString('hex') + '_' + agent);
  if (fs.existsSync(workDir)) {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
  
  cp.execSync(`git clone ${zodDir} ${workDir}`, { stdio: 'ignore' });
  cp.execSync('git checkout 1fb56a5c', { cwd: workDir, stdio: 'ignore' });
  
  // Apply test patch
  try {
    cp.execSync('git apply "' + testPatch + '"', { cwd: workDir, stdio: 'ignore' });
  } catch (e) {
    try {
        cp.execSync('git apply --ignore-whitespace "' + testPatch + '"', { cwd: workDir, stdio: 'ignore' });
    } catch(e2) {
        console.log(agent + ': TEST PATCH FAIL');
    }
  }

  // Apply agent patch
  try {
    cp.execSync('git apply "' + agentPatch + '"', { cwd: workDir, stdio: 'ignore' });
  } catch (e) {
    try {
        cp.execSync('git apply --ignore-whitespace "' + agentPatch + '"', { cwd: workDir, stdio: 'ignore' });
    } catch(e2) {
        results[agent] = 'PATCH_FAIL';
        failed++;
        return;
    }
  }

  cp.execSync('node -e "const fs=require(\'fs\'); [\'vitest.config.ts\', \'packages/zod/vitest.config.ts\'].forEach(f => { if(fs.existsSync(f)) { fs.writeFileSync(f, fs.readFileSync(f, \'utf8\').replace(/enabled:\\\\s*true/g, \'enabled: false\')); } });"', { cwd: workDir, stdio: 'ignore' });

  return new Promise((resolve) => {
    const child = cp.exec('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', { cwd: workDir });
    
    let isDone = false;
    let timer = setTimeout(() => {
      if (isDone) return;
      isDone = true;
      try { cp.execSync('taskkill /pid ' + child.pid + ' /T /F', { stdio: 'ignore' }); } catch(e) {}
      results[agent] = 'TIMEOUT';
      failed++;
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
      resolve();
    });
  });
}

async function processQueue() {
  while (queue.length > 0) {
    const agent = queue.shift();
    await runTest(agent);
    console.log(agent + ': ' + results[agent]);
  }
}

async function main() {
  const workers = [];
  for (let i = 0; i < MAX_CONCURRENT; i++) {
    workers.push(processQueue());
  }
  await Promise.all(workers);
  
  let md = `# Final Agent Evaluation Results\n\n`;
  md += `**Total Agents**: ${agents.length}\n`;
  md += `**Passed Agents**: ${passed} (${((passed / agents.length) * 100).toFixed(2)}%)\n`;
  md += `**Failed Agents**: ${failed}\n\n`;
  md += `| Agent | Result |\n`;
  md += `|---|---|\n`;

  for (const agent of agents) {
    md += `| ${agent} | ${results[agent]} |\n`;
  }
  
  fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/final_parallel_results.md', md);
  fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/final_parallel_results.json', JSON.stringify(results, null, 2));
  console.log('Results saved.');
}

main();
