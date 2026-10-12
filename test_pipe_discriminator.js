const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';

const pipeTest = `
test("pipe preserves skipEncoding in container encode", () => {
  const schema = z.object({
    val: z.pipe(z.string(), z.string().default("def", { skipEncoding: true })),
  });
  expect(schema.encode({ val: "def" })).toEqual({});
  expect(schema.encode({ val: "other" })).toEqual({ val: "other" });
});
`;

const specPath = path.join(ZOD_DIR, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts');
const baseSpec = fs.readFileSync(specPath, 'utf8');
const modifiedSpec = baseSpec + '\n' + pipeTest;

for (const agentId of [5, 8, 11, 'solution']) {
  execSync('git reset --hard HEAD', { cwd: ZOD_DIR, stdio: 'pipe' });
  execSync('git clean -fd', { cwd: ZOD_DIR, stdio: 'pipe' });

  if (agentId === 'solution') {
    execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/MAA/solution.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
  } else {
    const p = path.join(AGENT_DIR, 'Nova_Nova_' + agentId, 'solution-patch.patch');
    let txt = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
    const tmp = path.join(ZOD_DIR, '_tmp.patch');
    fs.writeFileSync(tmp, txt, 'utf8');
    execSync('git apply --whitespace=fix _tmp.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
  }

  fs.writeFileSync(specPath, modifiedSpec, 'utf8');

  try {
    execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', {
      cwd: ZOD_DIR,
      stdio: 'pipe',
      timeout: 30000
    });
    console.log('Agent ' + agentId + ': PASS');
  } catch (err) {
    console.log('Agent ' + agentId + ': FAIL');
  }
}
