const fs = require("fs");
const { execSync } = require("child_process");

const equalDateTest = `
test("deep equality matches identical Date values (LLM trap)", () => {
  const d1 = new Date("2026-01-01");
  const d2 = new Date("2026-01-01");
  const schema = z.any().default(d1, { skipEncoding: true });
  expect(z.object({ d: schema }).encode({ d: d2 })).toEqual({});
});
`;

const results = {};
for (const i of [1, 5, 7, 8, 12]) {
  execSync("git reset --hard HEAD", {stdio: "ignore"});
  execSync("git clean -fd", {stdio: "ignore"});
  execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore"});
  
  let content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8");
  fs.writeFileSync("packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", content + "\n" + equalDateTest);
  
  try {
    execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t \"matches identical Date values\"", {stdio: "ignore", timeout: 15000});
    results[i] = "PASS";
  } catch (e) {
    results[i] = "FAIL";
  }
}
console.log("Equal Date Test:");
console.log(JSON.stringify(results, null, 2));

const equalRegexTest = `
test("deep equality matches identical RegExp values (LLM trap)", () => {
  const r1 = /a/g;
  const r2 = /a/g;
  const schema = z.any().default(r1, { skipEncoding: true });
  expect(z.object({ r: schema }).encode({ r: r2 })).toEqual({});
});
`;

const regexResults = {};
for (const i of [1, 5, 7, 8, 12]) {
  execSync("git reset --hard HEAD", {stdio: "ignore"});
  execSync("git clean -fd", {stdio: "ignore"});
  execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore"});
  
  let content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8");
  fs.writeFileSync("packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", content + "\n" + equalRegexTest);
  
  try {
    execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t \"matches identical RegExp\"", {stdio: "ignore", timeout: 15000});
    regexResults[i] = "PASS";
  } catch (e) {
    regexResults[i] = "FAIL";
  }
}
console.log("Equal RegExp Test:");
console.log(JSON.stringify(regexResults, null, 2));

