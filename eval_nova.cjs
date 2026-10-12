const fs = require('fs');
const cp = require('child_process');
const path = require('path');
const os = require('os');

const agentsDir = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-3RAMRAM';
const zodDir = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const testFileSource = path.join(zodDir, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts');
const testFileContent = fs.readFileSync(testFileSource, 'utf8');

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
const MAX_CONCURRENT = 8;

async function runTest(agent) {
  const agentPatch = path.join(agentsDir, agent, 'solution-patch.patch');
  if (!fs.existsSync(agentPatch)) {
    results[agent] = { status: 'NO_PATCH', passedTests: 0, totalTests: 33 };
    failedCount++;
    return;
  }

  const workDir = path.join(os.tmpdir(), 'zod_eval_nova_' + agent);
  if (fs.existsSync(workDir)) {
    fs.rmSync(workDir, { recursive: true, force: true });
  }

  try {
    cp.execSync(`git clone ${zodDir} ${workDir}`, { stdio: 'ignore' });
    cp.execSync('git checkout 1fb56a5c', { cwd: workDir, stdio: 'ignore' });
    cp.execSync('git clean -fd', { cwd: workDir, stdio: 'ignore' });

    try {
      cp.execSync(`git apply "${agentPatch}"`, { cwd: workDir, stdio: 'ignore' });
    } catch (e1) {
      try {
        cp.execSync(`git apply --ignore-whitespace "${agentPatch}"`, { cwd: workDir, stdio: 'ignore' });
      } catch (e2) {
        results[agent] = { status: 'PATCH_FAIL', passedTests: 0, totalTests: 33 };
        failedCount++;
        fs.rmSync(workDir, { recursive: true, force: true });
        return;
      }
    }

    // Write latest test file
    const testDest = path.join(workDir, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts');
    fs.writeFileSync(testDest, testFileContent, 'utf8');

    return new Promise((resolve) => {
      const child = cp.exec(
        'npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts --no-typecheck',
        { cwd: workDir }
      );

      let output = '';
      child.stdout.on('data', (d) => (output += d));
      child.stderr.on('data', (d) => (output += d));

      let isDone = false;
      let timer = setTimeout(() => {
        if (isDone) return;
        isDone = true;
        try {
          cp.execSync('taskkill /pid ' + child.pid + ' /T /F', { stdio: 'ignore' });
        } catch (e) {}
        results[agent] = { status: 'TIMEOUT', passedTests: 0, totalTests: 33 };
        failedCount++;
        fs.rmSync(workDir, { recursive: true, force: true });
        resolve();
      }, 25000);

      child.on('exit', (code) => {
        if (isDone) return;
        isDone = true;
        clearTimeout(timer);

        // Parse test pass count from vitest output
        const match = output.match(/Tests\s+(\d+)\s+failed\s+\|\s+(\d+)\s+passed/);
        const matchAllPass = output.match(/Tests\s+(\d+)\s+passed\s+\((\d+)\)/);
        
        let p = 0;
        let t = 33;
        if (match) {
          p = parseInt(match[2], 10);
          const f = parseInt(match[1], 10);
          t = p + f;
        } else if (matchAllPass) {
          p = parseInt(matchAllPass[1], 10);
          t = p;
        }

        if (code === 0 && p > 0) {
          results[agent] = { status: 'PASS', passedTests: p, totalTests: t };
          passedCount++;
        } else {
          results[agent] = { status: `FAIL (${p}/${t} passed)`, passedTests: p, totalTests: t };
          failedCount++;
        }

        try {
          fs.rmSync(workDir, { recursive: true, force: true });
        } catch (e) {}
        resolve();
      });
    });
  } catch (err) {
    results[agent] = { status: 'ERROR', passedTests: 0, totalTests: 33 };
    failedCount++;
    try {
      fs.rmSync(workDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

async function worker() {
  while (queue.length > 0) {
    const agent = queue.shift();
    console.log(`Evaluating ${agent}...`);
    await runTest(agent);
    console.log(`Completed ${agent}: ${results[agent].status}`);
  }
}

async function main() {
  console.log(`Starting evaluation of ${agents.length} Nova agent solutions...`);
  const workers = [];
  for (let i = 0; i < MAX_CONCURRENT; i++) {
    workers.push(worker());
  }
  await Promise.all(workers);

  console.log('\n--- Final Nova Evaluation Results ---');
  console.log(`Total Agents Tested: ${agents.length}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log(`Pass Rate: ${((passedCount / agents.length) * 100).toFixed(2)}%`);

  let md = `# Nova Evaluation Results Report\n\n`;
  md += `**Total Nova Agents Tested**: ${agents.length}\n`;
  md += `**Passed Agents**: ${passedCount}\n`;
  md += `**Failed Agents**: ${failedCount}\n`;
  md += `**Pass Rate**: ${((passedCount / agents.length) * 100).toFixed(2)}%\n\n`;
  md += `| Agent | Status | Passed Tests |\n`;
  md += `|---|---|---|\n`;

  for (const agent of agents) {
    const res = results[agent] || { status: 'UNKNOWN', passedTests: 0, totalTests: 33 };
    md += `| ${agent} | ${res.status} | ${res.passedTests}/${res.totalTests} |\n`;
  }

  fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/nova_evaluation_report.md', md, 'utf8');
  fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/nova_evaluation_results.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('Saved report to C:/Users/USER/OneDrive/Desktop/MAA/nova_evaluation_report.md');
}

main();
