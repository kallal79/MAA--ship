const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const agentsDir = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-3RAMRAM';
const zodDir = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';

// Read test patch content from TEST_PATCH_3_PASS_FIXED.patch
const patchContent = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/TEST_PATCH_3_PASS_FIXED.patch', 'utf8');

// Extract test file content from patch
const testFileLines = [];
let inTestFile = false;
for (const line of patchContent.split('\n')) {
  if (line.startsWith('+++ b/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts')) {
    inTestFile = true;
    continue;
  }
  if (inTestFile) {
    if (line.startsWith('diff --git') || line.startsWith('--- ')) break;
    if (line.startsWith('+')) {
      testFileLines.push(line.slice(1));
    }
  }
}
const testFileContent = testFileLines.join('\n');

// Write test file in zod repo
const testDest = path.join(zodDir, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts');
fs.writeFileSync(testDest, testFileContent, 'utf8');

const agents = fs.readdirSync(agentsDir).filter(f => f.startsWith('Nova_Nova_'));
agents.sort((a, b) => {
  const numA = parseInt(a.replace('Nova_Nova_', ''), 10);
  const numB = parseInt(b.replace('Nova_Nova_', ''), 10);
  return numA - numB;
});

let passedCount = 0;
let failedCount = 0;
let results = {};

console.log(`Evaluating ${agents.length} Nova agent solutions...`);

for (const agent of agents) {
  const agentPatch = path.join(agentsDir, agent, 'solution-patch.patch');
  if (!fs.existsSync(agentPatch)) {
    results[agent] = { status: 'NO_PATCH', passedTests: 0, totalTests: 31 };
    failedCount++;
    continue;
  }

  // 1. Reset zod repo to base
  cp.execSync('git reset HEAD --hard', { cwd: zodDir, stdio: 'ignore' });
  cp.execSync('git clean -fd', { cwd: zodDir, stdio: 'ignore' });
  cp.execSync('git checkout 1fb56a5c', { cwd: zodDir, stdio: 'ignore' });

  // 2. Write test file
  fs.writeFileSync(testDest, testFileContent, 'utf8');

  // 3. Apply agent solution patch
  let patchSuccess = false;
  try {
    cp.execSync(`git apply "${agentPatch}"`, { cwd: zodDir, stdio: 'ignore' });
    patchSuccess = true;
  } catch (e1) {
    try {
      cp.execSync(`git apply --ignore-whitespace "${agentPatch}"`, { cwd: zodDir, stdio: 'ignore' });
      patchSuccess = true;
    } catch (e2) {
      results[agent] = { status: 'PATCH_FAIL', passedTests: 0, totalTests: 31 };
      failedCount++;
      continue;
    }
  }

  // 4. Run vitest
  try {
    const output = cp.execSync(
      'npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck',
      { cwd: zodDir, encoding: 'utf8', timeout: 15000 }
    );

    const match = output.match(/Tests\s+(\d+)\s+failed\s+\|\s+(\d+)\s+passed/);
    const matchAllPass = output.match(/Tests\s+(\d+)\s+passed\s+\((\d+)\)/);

    let p = 0;
    let t = 31;
    if (match) {
      p = parseInt(match[2], 10);
      const f = parseInt(match[1], 10);
      t = p + f;
    } else if (matchAllPass) {
      p = parseInt(matchAllPass[1], 10);
      t = p;
    }

    if (p > 0 && p === t) {
      results[agent] = { status: 'PASS', passedTests: p, totalTests: t };
      passedCount++;
      console.log(`  ${agent}: PASS (${p}/${t})`);
    } else {
      results[agent] = { status: `FAIL (${p}/${t} passed)`, passedTests: p, totalTests: t };
      failedCount++;
      console.log(`  ${agent}: FAIL (${p}/${t})`);
    }
  } catch (e) {
    const output = e.stdout || e.stderr || '';
    const match = output.match(/Tests\s+(\d+)\s+failed\s+\|\s+(\d+)\s+passed/);
    let p = 0;
    let t = 31;
    if (match) {
      p = parseInt(match[2], 10);
      const f = parseInt(match[1], 10);
      t = p + f;
    }
    results[agent] = { status: `FAIL (${p}/${t} passed)`, passedTests: p, totalTests: t };
    failedCount++;
    console.log(`  ${agent}: FAIL (${p}/${t})`);
  }
}

// Re-apply CLEAN_SOLUTION_FINAL.patch to leave zod repo clean and working
cp.execSync('git reset HEAD --hard', { cwd: zodDir, stdio: 'ignore' });
cp.execSync('git clean -fd', { cwd: zodDir, stdio: 'ignore' });
cp.execSync('git checkout 1fb56a5c', { cwd: zodDir, stdio: 'ignore' });
cp.execSync('git apply C:/Users/USER/OneDrive/Desktop/MAA/CLEAN_SOLUTION_FINAL.patch', { cwd: zodDir, stdio: 'ignore' });
cp.execSync('git apply C:/Users/USER/OneDrive/Desktop/MAA/TEST_PATCH_ONLY_UPLOAD_THIS.patch', { cwd: zodDir, stdio: 'ignore' });

console.log('\n=======================================');
console.log(`Total Nova Agents Evaluated: ${agents.length}`);
console.log(`Passed Agents: ${passedCount}`);
console.log(`Failed Agents: ${failedCount}`);
console.log(`Pass Rate: ${((passedCount / agents.length) * 100).toFixed(2)}%`);
console.log('=======================================\n');

let md = `# Final Agent Evaluation Results\n\n`;
md += `| Agent | Result |\n`;
md += `|---|---|\n`;

for (const agent of agents) {
  const res = results[agent] || { status: 'UNKNOWN' };
  md += `| ${agent} | ${res.status} |\n`;
}

fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/every_agent_local_result.md', md, 'utf8');
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/every_agent_local_result.json', JSON.stringify(results, null, 2), 'utf8');
console.log('Saved evaluation results to every_agent_local_result.md!');
