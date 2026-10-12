const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';
const TEST_PATCH = 'C:/Users/USER/OneDrive/Desktop/MAA/1_UPLOAD_THIS_AS_TEST_PATCH/test.patch';

// Let's create candidate test specs and evaluate each against all 13 agents + reference solution
const candidateTest = `
// Map shallow mode compares both key and value identities
test("Map shallow mode compares both key and value identities", () => {
  const k1 = { id: 1 };
  const v1 = { val: "a" };
  const schema = z.object({
    m: z.map(z.object({ id: z.number() }), z.object({ val: z.string() })).default(
      new Map([[k1, v1]]),
      { skipEncoding: { mode: "shallow" } }
    ),
  });
  expect(schema.encode({ m: new Map([[k1, v1]]) })).toEqual({});
  expect(schema.encode({ m: new Map([[{ id: 1 }, v1]]) })).toEqual({
    m: new Map([[{ id: 1 }, v1]]),
  });
});
`;

const baseTestPatch = fs.readFileSync(TEST_PATCH, 'utf8');

// We append candidateTest before diff --git a/test.sh
const parts = baseTestPatch.split('diff --git a/test.sh');
let testSpecPart = parts[0];
const testShPart = 'diff --git a/test.sh' + parts[1];

// Let's create a temporary combined spec
const specPath = path.join(ZOD_DIR, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts');

const results = [];

function cleanRepo() {
  try {
    execSync('git reset --hard HEAD', { cwd: ZOD_DIR, stdio: 'pipe' });
    execSync('git clean -fd', { cwd: ZOD_DIR, stdio: 'pipe' });
  } catch (e) {}
}

for (const id of ['solution', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]) {
  cleanRepo();

  if (id === 'solution') {
    execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/MAA/2_UPLOAD_THIS_AS_SOLUTION_PATCH/solution.patch', {
      cwd: ZOD_DIR,
      stdio: 'pipe'
    });
  } else {
    const p = path.join(AGENT_DIR, 'Nova_Nova_' + id, 'solution-patch.patch');
    if (!fs.existsSync(p)) {
      results.push({ agent: 'Nova #' + id, status: 'NO_PATCH' });
      continue;
    }
    let txt = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
    const tmp = path.join(ZOD_DIR, '_tmp.patch');
    fs.writeFileSync(tmp, txt, 'utf8');
    try {
      execSync('git apply --whitespace=fix _tmp.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
    } catch (e) {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
      results.push({ agent: 'Nova #' + id, status: 'PATCH_FAILED' });
      continue;
    }
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  }

  // Apply base test patch
  const tmpTest = path.join(ZOD_DIR, '_tmp_test.patch');
  fs.writeFileSync(tmpTest, baseTestPatch, 'utf8');
  execSync('git apply --whitespace=fix _tmp_test.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
  if (fs.existsSync(tmpTest)) fs.unlinkSync(tmpTest);

  // Append the candidate test to the spec file
  fs.appendFileSync(specPath, '\n' + candidateTest, 'utf8');

  try {
    const out = execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', {
      cwd: ZOD_DIR,
      stdio: 'pipe',
      timeout: 30000
    }).toString('utf8');

    const m = out.match(/Tests\s+(\d+)\s+passed/);
    const passed = m ? m[1] : 'ALL';
    results.push({ agent: id === 'solution' ? 'Solution' : 'Nova #' + id, status: 'PASS', score: `${passed}/${passed}` });
  } catch (err) {
    const out = (err.stdout ? err.stdout.toString('utf8') : '') + (err.stderr ? err.stderr.toString('utf8') : '');
    const m = out.match(/Tests\s+(?:(\d+)\s+failed\s*\|\s*)?(\d+)\s+passed/);
    const passed = m ? m[2] : '0';
    const failed = m ? m[1] : '1';
    results.push({ agent: id === 'solution' ? 'Solution' : 'Nova #' + id, status: 'FAIL', score: `${passed} passed, ${failed} failed` });
  }
}

cleanRepo();

console.log('\n======================================================');
console.log('       EVALUATION WITH 2-PASS CANDIDATE TEST          ');
console.log('======================================================');
console.table(results);

const agentPasses = results.filter(r => r.agent.startsWith('Nova') && r.status === 'PASS');
console.log(`\nNova Passing Count: ${agentPasses.length} / 13 (${((agentPasses.length/13)*100).toFixed(1)}%)`);
console.log(`Nova Passing Agents: ${agentPasses.map(a => a.agent).join(', ')}`);
console.log(`Reference Solution: ${results.find(r => r.agent === 'Solution')?.status}`);
