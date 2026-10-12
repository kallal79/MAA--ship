const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const zodDir = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const agentsDir = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-3RAMRAM';

// Reset first
try {
  cp.execSync('git reset HEAD --hard', { cwd: zodDir, stdio: 'ignore' });
  cp.execSync('git clean -fd', { cwd: zodDir, stdio: 'ignore' });
  cp.execSync('git checkout 1fb56a5c', { cwd: zodDir, stdio: 'ignore' });
} catch (e) {}

// Apply patch
try {
  cp.execSync(`git apply "${path.join(agentsDir, 'Nova_Nova_11', 'solution-patch.patch')}"`, { cwd: zodDir, stdio: 'ignore' });
} catch (e) {
  cp.execSync(`git apply --ignore-whitespace "${path.join(agentsDir, 'Nova_Nova_11', 'solution-patch.patch')}"`, { cwd: zodDir, stdio: 'ignore' });
}

// Append to default.test.ts
const defaultTestPath = path.join(zodDir, 'packages/zod/src/v4/classic/tests/default.test.ts');
fs.appendFileSync(
  defaultTestPath,
  `
test("debug nova 11", () => {
  const schema = z.object({ a: z.string().default("x", { skipEncoding: true }) });
  const result = z.encode(schema, { a: "x" });
  console.log("NOVA 11 RESULT:", result);
  expect(result).toEqual({});
});
`,
  'utf8'
);

try {
  const out = cp.execSync('npx vitest run packages/zod/src/v4/classic/tests/default.test.ts --no-typecheck', {
    cwd: zodDir,
    encoding: 'utf8',
  });
  console.log(out);
} catch (e) {
  console.log(e.stdout || e.stderr || e.message);
}
