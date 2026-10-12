const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const zodDir = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const agentsDir = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-3RAMRAM';
const maaDir = 'C:/Users/USER/OneDrive/Desktop/MAA';
const uploadDir = path.join(maaDir, 'FINAL_UPLOAD');

// Read test patch content from TEST_PATCH_3_PASS.patch
const patchContent = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/TEST_PATCH_3_PASS.patch', 'utf8');

// Extract test file content from patch
const testFileLines = [];
let inTestFile = false;
for (const line of patchContent.split('\n')) {
  if (line.startsWith('+++ b/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts')) {
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

const testDest = path.join(zodDir, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts');
const specDest = path.join(zodDir, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts');

function resetRepo() {
  try {
    cp.execSync('git reset HEAD --hard', { cwd: zodDir, stdio: 'ignore' });
    cp.execSync('git clean -fd', { cwd: zodDir, stdio: 'ignore' });
    cp.execSync('git checkout 1fb56a5c', { cwd: zodDir, stdio: 'ignore' });
  } catch (e) {}
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
  fs.writeFileSync(testDest, testFileContent, 'utf8');
  fs.writeFileSync(specDest, testFileContent, 'utf8');
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

console.log(`Starting 3-Pass Target Evaluation across ${agents.length} Nova agents...`);

for (const agent of agents) {
  resetRepo();
  disableTypecheck();
  writeTests();

  const agentPatch = path.join(agentsDir, agent, 'solution-patch.patch');
  if (!fs.existsSync(agentPatch)) {
    results[agent] = 'FAIL';
    failedCount++;
    continue;
  }

  try {
    cp.execSync(`git apply "${agentPatch}"`, { cwd: zodDir, stdio: 'ignore' });
  } catch (e) {
    try {
      cp.execSync(`git apply --ignore-whitespace "${agentPatch}"`, { cwd: zodDir, stdio: 'ignore' });
    } catch (e2) {}
  }

  try {
    const out = cp.execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts --no-typecheck', { cwd: zodDir, encoding: 'utf8' });
    if (out.includes('46 passed') || out.includes('Test Files  1 passed')) {
      results[agent] = 'PASS';
      passedCount++;
      console.log(`  ${agent}: PASS`);
    } else {
      results[agent] = 'FAIL';
      failedCount++;
      console.log(`  ${agent}: FAIL`);
    }
  } catch (e) {
    results[agent] = 'FAIL';
    failedCount++;
    console.log(`  ${agent}: FAIL`);
  }
}

// Verify Final Reference Solution
resetRepo();
disableTypecheck();
writeTests();

try {
  cp.execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/CLEAN_SOLUTION_FINAL.patch"`, { cwd: zodDir, stdio: 'ignore' });
} catch (e) {
  cp.execSync(`git apply --ignore-whitespace "C:/Users/USER/OneDrive/Desktop/MAA/CLEAN_SOLUTION_FINAL.patch"`, { cwd: zodDir, stdio: 'ignore' });
}

let solutionPass = false;
try {
  const out = cp.execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts --no-typecheck', { cwd: zodDir, encoding: 'utf8' });
  if (out.includes('46 passed') || out.includes('Test Files  1 passed')) {
    solutionPass = true;
    console.log(`\nFINAL_SOLUTION: PASS (100% Pass)`);
  } else {
    console.log(`\nFINAL_SOLUTION: FAIL`);
  }
} catch (e) {
  console.log(`\nFINAL_SOLUTION: FAIL`);
}

// Write exported patches into FINAL_UPLOAD
writeTests();

// 1. Solution patch
const srcFiles = [
  'packages/zod/src/v4/classic/schemas.ts',
  'packages/zod/src/v4/classic/external.ts',
  'packages/zod/src/v4/core/api.ts',
  'packages/zod/src/v4/core/parse.ts',
  'packages/zod/src/v4/core/schemas.ts',
  'packages/zod/src/v4/mini/schemas.ts',
  'packages/zod/src/v4/mini/external.ts'
];

cp.execSync('git reset HEAD', { cwd: zodDir });
for (const f of srcFiles) {
  if (fs.existsSync(path.join(zodDir, f))) {
    cp.execSync(`git add "${f}"`, { cwd: zodDir });
  }
}
let solutionDiff = cp.execSync('git diff --cached HEAD', { cwd: zodDir, encoding: 'utf8' }).replace(/\r\n/g, '\n');
fs.writeFileSync(path.join(uploadDir, 'solution.patch'), solutionDiff, 'utf8');

// 2. Test patch
cp.execSync('git reset HEAD', { cwd: zodDir });
const testFiles = [
  'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.test.ts',
  'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts'
];
for (const f of testFiles) {
  if (fs.existsSync(path.join(zodDir, f))) {
    cp.execSync(`git add "${f}"`, { cwd: zodDir });
  }
}
let testDiff = cp.execSync('git diff --cached HEAD', { cwd: zodDir, encoding: 'utf8' }).replace(/\r\n/g, '\n');
fs.writeFileSync(path.join(uploadDir, 'test.patch'), testDiff, 'utf8');
cp.execSync('git reset HEAD', { cwd: zodDir });

console.log('\n=======================================');
console.log(`Total Nova Agents Evaluated: ${agents.length}`);
console.log(`Passed Agents: ${passedCount}`);
console.log(`Failed Agents: ${failedCount}`);
console.log(`Pass Rate: ${((passedCount / agents.length) * 100).toFixed(2)}%`);
console.log('=======================================\n');

let md = `# Final Agent Evaluation Results\n\n`;
md += `**Total Agents Tested**: ${agents.length}\n`;
md += `**Passed Agents**: ${passedCount} (${((passedCount / agents.length) * 100).toFixed(2)}%)\n`;
md += `**Failed Agents**: ${failedCount}\n\n`;
md += `| Agent | Result |\n`;
md += `|---|---|\n`;

for (const agent of agents) {
  md += `| ${agent} | ${results[agent]} |\n`;
}

fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/every_agent_local_result.md', md, 'utf8');
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/every_agent_local_result.json', JSON.stringify(results, null, 2), 'utf8');
console.log('Saved report to every_agent_local_result.md');
