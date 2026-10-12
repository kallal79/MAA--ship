const fs = require("fs");
const { execSync } = require("child_process");

const symbolTest = `
test("deep equality handles symbol properties (LLM trap)", () => {
  const sym = Symbol("test");
  const a = { [sym]: 1, reg: 2 };
  const b = { [sym]: 1, reg: 2 };
  const schema = z.any().default(a, { skipEncoding: true });
  expect(schema.encode(b)).toEqual({});
});
`;

const results = {};
for (const i of [1, 5, 7, 8, 12]) {
  execSync("git reset --hard HEAD", {stdio: "ignore"});
  execSync("git clean -fd", {stdio: "ignore"});
  execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore"});
  
  let content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8");
  fs.writeFileSync("packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", content + "\n" + symbolTest);
  
  try {
    execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t \"handles symbol properties\"", {stdio: "ignore", timeout: 15000});
    results[i] = "PASS";
  } catch (e) {
    results[i] = "FAIL";
  }
}
console.log("Symbol Test:");
console.log(JSON.stringify(results, null, 2));

const regexTest = `
test("deep equality differentiates RegExp (LLM trap)", () => {
  const r1 = /a/g;
  const r2 = /a/i;
  const schema = z.any().default(r1, { skipEncoding: true });
  expect(schema.encode(r2)).toEqual(r2);
});
`;

const regexResults = {};
for (const i of [1, 5, 7, 8, 12]) {
  execSync("git reset --hard HEAD", {stdio: "ignore"});
  execSync("git clean -fd", {stdio: "ignore"});
  execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore"});
  
  let content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8");
  fs.writeFileSync("packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", content + "\n" + regexTest);
  
  try {
    execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t \"differentiates RegExp\"", {stdio: "ignore", timeout: 15000});
    regexResults[i] = "PASS";
  } catch (e) {
    regexResults[i] = "FAIL";
  }
}
console.log("RegExp Test:");
console.log(JSON.stringify(regexResults, null, 2));
