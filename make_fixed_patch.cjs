const fs = require('fs');
const cp = require('child_process');
const repoDir = "C:/Users/USER/OneDrive/Desktop/MAA/zod";

try {
  cp.execSync('git reset --hard HEAD', { cwd: repoDir, stdio: 'ignore' });
  cp.execSync('git clean -fd', { cwd: repoDir, stdio: 'ignore' });
  cp.execSync('git apply "C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH.patch"', { cwd: repoDir, stdio: 'ignore' });

  const testPath = repoDir + '/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts';
  let content = fs.readFileSync(testPath, 'utf8');

  // Replace nested defaults expectation
  content = content.replace(
    'expect(schema.encode({ val: "inner" })).toEqual({});',
    'expect(schema.encode({ val: "inner" })).toEqual({ val: "inner" });'
  );

  // Add bipartite Set test
  content += `\n\ntest("Set deep equality requires 1-to-1 bipartite matching", () => {
  const schema = z.object({
    s: z.set(z.object({ a: z.number() })).default(new Set([{ a: 1 }, { a: 2 }]), { skipEncoding: true }),
  });
  expect(schema.encode({ s: new Set([{ a: 1 }, { a: 1 }]) })).toEqual({
    s: new Set([{ a: 1 }, { a: 1 }])
  });
});`;

  fs.writeFileSync(testPath, content);

  cp.execSync('git add -A', { cwd: repoDir, stdio: 'ignore' });
  const diff = cp.execSync('git diff HEAD', { cwd: repoDir });
  fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/NEW_FIXED_TEST_PATCH.patch', diff);
  
  console.log("Created NEW_FIXED_TEST_PATCH.patch");
} catch (e) {
  console.log("Error:", e.message);
}
