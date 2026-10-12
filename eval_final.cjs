const fs = require('fs');
const cp = require('child_process');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const agentsDir = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-3RAMRAM';
const zodDir = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const testPatch = 'C:/Users/USER/OneDrive/Desktop/MAA/1_UPLOAD_THIS_AS_TEST_PATCH/test.patch';

const agents = fs.readdirSync(agentsDir).filter(f => f.startsWith('Nova_Nova_'));
agents.sort((a, b) => {
  const numA = parseInt(a.replace('Nova_Nova_', ''), 10);
  const numB = parseInt(b.replace('Nova_Nova_', ''), 10);
  return numA - numB;
});

let passedCount = 0;
let failedCount = 0;
let results = {};
const queue = [...agents];
const MAX_CONCURRENT = 12;

async function runTest(agent) {
  const agentPatch = path.join(agentsDir, agent, 'solution-patch.patch');
  if (!fs.existsSync(agentPatch)) {
    results[agent] = { status: 'NO_PATCH', passedTests: 0, totalTests: 31 };
    failedCount++;
    return;
  }

  // Create workspace with xcopy instead of git clone to avoid lock/clone issues
  const workDir = path.join(os.tmpdir(), 'zod_eval_f_' + crypto.randomBytes(4).toString('hex') + '_' + agent);
  if (fs.existsSync(workDir)) {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
  fs.mkdirSync(workDir, { recursive: true });

  try {
    cp.execSync(`xcopy "${zodDir}\\*" "${workDir}\\" /E /I /Q /H`, { stdio: 'ignore' });
    cp.execSync('git reset HEAD --hard', { cwd: workDir, stdio: 'ignore' });
    cp.execSync('git checkout 1fb56a5c', { cwd: workDir, stdio: 'ignore' });
    cp.execSync('git clean -fd', { cwd: workDir, stdio: 'ignore' });

    // Apply agent patch FIRST
    try {
      cp.execSync(`git apply "${agentPatch}"`, { cwd: workDir, stdio: 'ignore' });
    } catch (e1) {
      try {
        cp.execSync(`git apply --ignore-whitespace "${agentPatch}"`, { cwd: workDir, stdio: 'ignore' });
      } catch (e2) {
        results[agent] = { status: 'PATCH_FAIL', passedTests: 0, totalTests: 31 };
        failedCount++;
        return;
      }
    }

    // Disable typecheck
    cp.execSync(
      'node -e "const fs=require(\'fs\'); [\'vitest.config.ts\', \'packages/zod/vitest.config.ts\'].forEach(f => { if(fs.existsSync(f)) { fs.writeFileSync(f, fs.readFileSync(f, \'utf8\').replace(/enabled:\\\\s*true/g, \'enabled: false\')); } });"',
      { cwd: workDir, stdio: 'ignore' }
    );

    // Apply our final test patch
    try {
      cp.execSync(`git apply "${testPatch}"`, { cwd: workDir, stdio: 'ignore' });
    } catch (e1) {
      cp.execSync(`git apply --ignore-whitespace "${testPatch}"`, { cwd: workDir, stdio: 'ignore' });
    }

    return new Promise((resolve) => {
      const child = cp.exec(
        'npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck',
        { cwd: workDir }
      );

      let output = '';
      child.stdout.on('data', (d) => (output += d));
      child.stderr.on('data', (d) => (output += d));

      let isDone = false;
      let timer = setTimeout(() => {
        if (isDone) return;
        isDone = true;
        try { cp.execSync('taskkill /pid ' + child.pid + ' /T /F', { stdio: 'ignore' }); } catch (e) {}
        results[agent] = { status: 'TIMEOUT', passedTests: 0, totalTests: 31 };
        failedCount++;
        resolve();
      }, 35000);

      child.on('exit', (code) => {
        if (isDone) return;
        isDone = true;
        clearTimeout(timer);
        
        let passMatch = output.match(/✓\s+\d+\s+tests\s+passed/);
        let numPassed = 0;
        let total = 31;
        if (passMatch) {
            let m = output.match(/(\d+) passed/);
            if(m) numPassed = parseInt(m[1], 10);
        }

        if (code === 0) {
          results[agent] = { status: 'PASS', passedTests: 31, totalTests: 31 };
          passedCount++;
        } else {
          results[agent] = { status: 'FAIL', passedTests: numPassed, totalTests: 31 };
          failedCount++;
        }
        
        try { fs.rmSync(workDir, { recursive: true, force: true }); } catch (e) {}
        resolve();
      });
    });

  } catch (e) {
    results[agent] = { status: 'ERROR', passedTests: 0, totalTests: 31 };
    failedCount++;
  }
}

async function processQueue() {
  while (queue.length > 0) {
    const agent = queue.shift();
    await runTest(agent);
    console.log(agent + ': ' + results[agent].status + ' (' + results[agent].passedTests + '/' + results[agent].totalTests + ')');
  }
}

async function main() {
  console.log('Starting parallel evaluation...');
  const workers = [];
  for (let i = 0; i < MAX_CONCURRENT; i++) {
    workers.push(processQueue());
  }
  await Promise.all(workers);

  console.log('\\n=======================================');
  console.log(`Total Nova Agents Evaluated: ${agents.length}`);
  console.log(`Passed Agents: ${passedCount}`);
  console.log(`Failed Agents: ${failedCount}`);
  console.log(`Pass Rate: ${((passedCount / agents.length) * 100).toFixed(2)}%`);
  console.log('=======================================\\n');

  let md = `# Final Agent Evaluation Results (Final Tests)\\n\\n`;
  md += `**Total Agents**: ${agents.length}\\n`;
  md += `**Passed Agents**: ${passedCount} (${((passedCount / agents.length) * 100).toFixed(2)}%)\\n`;
  md += `**Failed Agents**: ${failedCount}\\n\\n`;
  md += `| Agent | Result | Passed Tests | Total Tests |\\n`;
  md += `|---|---|---|---|\\n`;

  for (const agent of agents) {
    md += `| ${agent} | ${results[agent].status} | ${results[agent].passedTests} | ${results[agent].totalTests} |\\n`;
  }

  fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/final_evaluation_report.md', md);
  fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/final_evaluation_results.json', JSON.stringify(results, null, 2));
  console.log('Results saved to final_evaluation_report.md');
}

main();
