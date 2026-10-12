const fs = require("fs");
const { execSync } = require("child_process");

const nonEnumTest = `
test("deep equality ignores non-enumerable properties (LLM trap)", () => {
  const a = {};
  const b = {};
  Object.defineProperty(a, 'hidden', { value: 1, enumerable: false });
  Object.defineProperty(b, 'hidden', { value: 2, enumerable: false });
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
  fs.writeFileSync("packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", content + "\n" + nonEnumTest);
  
  try {
    execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t \"ignores non-enumerable\"", {stdio: "ignore", timeout: 15000});
    results[i] = "PASS";
  } catch (e) {
    results[i] = "FAIL";
  }
}
console.log("Non-enumerable Test:");
console.log(JSON.stringify(results, null, 2));

const getterTest = `
test("deep equality evaluates getters (LLM trap)", () => {
  const a = { get val() { return 1; } };
  const b = { get val() { return 2; } };
  const schema = z.any().default(a, { skipEncoding: true });
  expect(schema.encode(b)).toEqual(b);
});
`;

const getterResults = {};
for (const i of [1, 5, 7, 8, 12]) {
  execSync("git reset --hard HEAD", {stdio: "ignore"});
  execSync("git clean -fd", {stdio: "ignore"});
  execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore"});
  
  let content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8");
  fs.writeFileSync("packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", content + "\n" + getterTest);
  
  try {
    execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t \"evaluates getters\"", {stdio: "ignore", timeout: 15000});
    getterResults[i] = "PASS";
  } catch (e) {
    getterResults[i] = "FAIL";
  }
}
console.log("Getter Test:");
console.log(JSON.stringify(getterResults, null, 2));

