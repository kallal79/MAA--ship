const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const zodDir = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const agentsDir = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-3RAMRAM';
const solPatch = 'C:/Users/USER/OneDrive/Desktop/MAA/FINAL_UPLOAD/solution.patch';

const testContent = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/scratch/baseline_423.ts', 'utf8') + '\n\n' + fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/scratch/new_tests_reduced.ts', 'utf8');
const testDest = path.join(zodDir, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts');
const specDest = path.join(zodDir, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts');

function resetRepo() {
  cp.execSync('git reset HEAD --hard', { cwd: zodDir, stdio: 'ignore' });
  cp.execSync('git clean -fd', { cwd: zodDir, stdio: 'ignore' });
  cp.execSync('git checkout 1fb56a5c', { cwd: zodDir, stdio: 'ignore' });
}

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

function writeTests() {
  fs.writeFileSync(testDest, testContent, 'utf8');
  fs.writeFileSync(specDest, testContent, 'utf8');
}

const agents = fs.readdirSync(agentsDir).filter(f => f.startsWith('Nova_Nova_'));
agents.sort((a, b) => {
  const numA = parseInt(a.replace('Nova_Nova_', ''), 10);
  const numB = parseInt(b.replace('Nova_Nova_', ''), 10);
  return numA - numB;
});

let passedCount = 0;
let failedCount = 0;
let results = {};

for (const agent of agents) {
  resetRepo();
  disableTypecheck();
  writeTests();

  try {
    cp.execSync(`git apply "${path.join(agentsDir, agent, 'solution-patch.patch')}"`, { cwd: zodDir, stdio: 'ignore' });
  } catch (e) {
    try {
      cp.execSync(`git apply --ignore-whitespace "${path.join(agentsDir, agent, 'solution-patch.patch')}"`, { cwd: zodDir, stdio: 'ignore' });
    } catch (e2) {}
  }

  try {
    cp.execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts --no-typecheck', { cwd: zodDir, stdio: 'ignore' });
    results[agent] = 'PASS';
    passedCount++;
    console.log(`${agent}: PASS`);
  } catch (e) {
    results[agent] = 'FAIL';
    failedCount++;
    console.log(`${agent}: FAIL`);
  }
}

// Check final reference solution
resetRepo();
disableTypecheck();
writeTests();

try {
  cp.execSync(`git apply "${solPatch}"`, { cwd: zodDir, stdio: 'ignore' });
} catch (e) {
  cp.execSync(`git apply --ignore-whitespace "${solPatch}"`, { cwd: zodDir, stdio: 'ignore' });
}

try {
  cp.execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts --no-typecheck', { cwd: zodDir, stdio: 'ignore' });
  console.log(`FINAL_SOLUTION: PASS`);
} catch (e) {
  console.log(`FINAL_SOLUTION: FAIL`);
}

console.log('\n=======================================');
console.log(`Total Nova Agents Evaluated: ${agents.length}`);
console.log(`Passed Agents: ${passedCount}`);
console.log(`Failed Agents: ${failedCount}`);
console.log(`Pass Rate: ${((passedCount / agents.length) * 100).toFixed(2)}%`);
console.log('=======================================\n');

let md = `# Final Agent Evaluation Results\n\n`;
md += `**Total Agents**: ${agents.length}\n`;
md += `**Passed Agents**: ${passedCount} (${((passedCount / agents.length) * 100).toFixed(2)}%)\n`;
md += `**Failed Agents**: ${failedCount}\n\n`;
md += `| Agent | Result |\n`;
md += `|---|---|\n`;

for (const agent of agents) {
  md += `| ${agent} | ${results[agent]} |\n`;
}

fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/every_agent_local_result.md', md, 'utf8');
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/every_agent_local_result.json', JSON.stringify(results, null, 2), 'utf8');
