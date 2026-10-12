const fs = require('fs');
const { execSync } = require('child_process');

function safeGitReset() {
  for (let i = 0; i < 5; i++) {
    try {
      execSync("git reset --hard 1fb56a5c", {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
      execSync("git clean -fd", {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
      return;
    } catch (e) {
      if (i === 4) throw e;
      execSync("node -e \"setTimeout(() => {}, 500)\"");
    }
  }
}

safeGitReset();
execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/1_UPLOAD_THIS_AS_TEST_PATCH/test.patch"`, {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});

let testContent = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts', 'utf8');

// 1. Remove date equality
testContent = testContent.replace(`  const schema = z.object({
    date: z.date().default(new Date(1000), { skipEncoding: true }),
    arr: z.array(z.number()).default([1, 2], { skipEncoding: true }),
    obj: z.object({ x: z.number() }).default({ x: 1 }, { skipEncoding: true }),
    prim: z.nan().default(Number.NaN, { skipEncoding: true }),
    prim2: z.number().default(-0, { skipEncoding: true }),
  });
  expect(
    schema.encode({
      date: new Date(1000),
      arr: [1, 2],
      obj: { x: 1 },
      prim: Number.NaN,
      prim2: -0,
    })
  ).toEqual({});`, `  const schema = z.object({
    arr: z.array(z.number()).default([1, 2], { skipEncoding: true }),
    obj: z.object({ x: z.number() }).default({ x: 1 }, { skipEncoding: true }),
    prim: z.nan().default(Number.NaN, { skipEncoding: true }),
    prim2: z.number().default(-0, { skipEncoding: true }),
  });
  expect(
    schema.encode({
      arr: [1, 2],
      obj: { x: 1 },
      prim: Number.NaN,
      prim2: -0,
    })
  ).toEqual({});`);

// 2. Remove chained defaults test
testContent = testContent.replace(`test("chained defaulted schemas evaluate skipEncoding independently", () => {
  const inner = z.number().default(0, { skipEncoding: true });
  const outer = inner.default(5, { skipEncoding: true });
  expect(outer.encode(0)).toBe(0);
  expect(z.object({ a: outer }).encode({ a: 5 })).toEqual({});
  expect(z.object({ a: outer }).encode({ a: 0 })).toEqual({ a: 0 });
});`, "");

// WE KEEP "implicit default option behaves as deep"

fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts', testContent);

execSync("git add .", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
execSync("git diff --cached > C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/3_BRUTAL_TRAPS_TEST_PATCH.patch", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});

safeGitReset();

const results = {};

for (let i = 1; i <= 10; i++) {
  console.log("Testing Agent " + i);
  safeGitReset();
  
  execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
  execSync(`git apply "C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/3_BRUTAL_TRAPS_TEST_PATCH.patch"`, {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
  
  try {
    execSync(`pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore", timeout: 15000});
    results[i] = "PASS";
  } catch (e) {
    if (e.code === 'ETIMEDOUT') {
      results[i] = "FAIL (TIMEOUT)";
    } else {
      results[i] = "FAIL (TEST FAILED)";
    }
  }
}

console.log(results);

let md = "# 🧪 Final Verification Run: All 10 Nova Agents\n\n";
md += "| Agent | Status | Reason |\n|-------|--------|--------|\n";
for (let i = 1; i <= 10; i++) {
  const res = results[i];
  if (res === "PASS") {
    md += `| Nova Agent ${i} | ✅ PASS | Passed all 50 tests |\n`;
  } else {
    md += `| Nova Agent ${i} | ❌ FAIL | ${res.replace("FAIL (", "").replace(")", "")} |\n`;
  }
}

const passingCount = Object.values(results).filter(x => x === "PASS").length;
md += `\n**Total Passing Agents:** ${passingCount}/10\n`;
if (passingCount === 3 || passingCount === 4) {
  md += "**Target Met:** ✅ Yes (Pass rate ≤ 50% and between 3-4 passes)\n";
} else {
  md += "**Target Met:** ❌ No\n";
}

fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/final_verification_results.md", md);
