const fs = require('fs');
const cp = require('child_process');
const repoDir = "C:/Users/USER/OneDrive/Desktop/MAA/zod";

try {
  cp.execSync('git reset --hard HEAD', { cwd: repoDir, stdio: 'ignore' });
  cp.execSync('git clean -fd', { cwd: repoDir, stdio: 'ignore' });
  cp.execSync('git apply "C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH_V22.patch"', { cwd: repoDir, stdio: 'ignore' });

  const testContent = `

test("nested defaults with conflicting skipEncoding overrides", () => {
  const inner = z.string().default("inner", { skipEncoding: true });
  const outer = inner.default("outer", { skipEncoding: false });
  const schema = z.object({ val: outer });
  expect(schema.encode({ val: "inner" })).toEqual({ val: "inner" });
});
`;

  fs.appendFileSync(repoDir + '/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts', testContent);

  cp.execSync('git add -A', { cwd: repoDir, stdio: 'ignore' });
  const diff = cp.execSync('git diff HEAD', { cwd: repoDir });
  fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH_V23.patch', diff);
  
  console.log("V23 created successfully!");
} catch (e) {
  console.log("Error:", e.message);
}
