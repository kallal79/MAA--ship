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

// Generate the proper test patch WITH ONLY DATE TRAP REMOVED
safeGitReset();
execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/1_UPLOAD_THIS_AS_TEST_PATCH/test.patch"`, {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});

let testContent = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts', 'utf8');

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

fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts', testContent);

// Clean up
safeGitReset();

const detailedResults = {};

for (let i = 1; i <= 10; i++) {
  console.log("Testing Agent " + i);
  safeGitReset();
  
  execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
  
  // Re-apply our script changes manually
  execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/1_UPLOAD_THIS_AS_TEST_PATCH/test.patch"`, {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
  let tc = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts', 'utf8');
  tc = tc.replace(/date: z\.date\(\)\.default\(new Date\(1000\), \{ skipEncoding: true \}\),/g, "");
  tc = tc.replace(/date: new Date\(1000\),/g, "");
  fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts', tc);

  try {
    execSync(`pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false --reporter=json > out.json`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", timeout: 15000});
    detailedResults[i] = { passed: true, failedTests: [] };
  } catch (e) {
    if (e.code === 'ETIMEDOUT') {
      detailedResults[i] = { passed: false, failedTests: ["TIMEOUT"] };
    } else {
      try {
        const out = JSON.parse(fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/zod/out.json', 'utf8'));
        const failed = out.testResults[0].assertionResults.filter(a => a.status === 'failed').map(a => a.title);
        detailedResults[i] = { passed: false, failedTests: failed };
      } catch (err) {
        detailedResults[i] = { passed: false, failedTests: ["PARSE ERROR"] };
      }
    }
  }
}

console.log(JSON.stringify(detailedResults, null, 2));
