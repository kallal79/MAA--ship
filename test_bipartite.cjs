const fs = require('fs');
const cp = require('child_process');
const repoDir = "C:/Users/USER/OneDrive/Desktop/MAA/zod";
const originalDir = "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-ORIGINAL-ONE";

try {
  cp.execSync('git reset --hard HEAD', { cwd: repoDir, stdio: 'ignore' });
  cp.execSync('git clean -fd', { cwd: repoDir, stdio: 'ignore' });
  cp.execSync('git apply "C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH.patch"', { cwd: repoDir, stdio: 'ignore' });

  // Remove the nested defaults test that causes issues
  let content = fs.readFileSync(repoDir + '/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts', 'utf8');
  content = content.replace(
    /test\("nested defaults with conflicting skipEncoding overrides".*?\}\);/s,
    ''
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

  fs.writeFileSync(repoDir + '/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts', content);

  cp.execSync('git add -A', { cwd: repoDir, stdio: 'ignore' });
  const diff = cp.execSync('git diff HEAD', { cwd: repoDir });
  fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/TEST_PATCH_BIPARTITE.patch', diff);

  let origResults = [];
  for (let i = 1; i <= 3; i++) {
    cp.execSync('git reset --hard HEAD', { cwd: repoDir, stdio: 'ignore' });
    cp.execSync('git clean -fd', { cwd: repoDir, stdio: 'ignore' });
    const agentPatch = require('path').join(originalDir, `Nova_Nova_${i}`, 'solution-patch.patch');
    cp.execSync(`git apply "${agentPatch}"`, { cwd: repoDir, stdio: 'ignore' });
    cp.execSync(`git apply "C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/TEST_PATCH_BIPARTITE.patch"`, { cwd: repoDir, stdio: 'ignore' });
    try {
      cp.execSync('pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false', {
        cwd: repoDir, stdio: 'ignore'
      });
      origResults.push(`Agent ${i}: PASS`);
    } catch (e) {
      origResults.push(`Agent ${i}: FAIL`);
    }
  }
  console.log("=== ORIGINAL AGENTS ===");
  origResults.forEach(r => console.log(r));

} catch (e) {
  console.log("Error:", e.message);
}
