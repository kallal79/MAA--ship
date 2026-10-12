const fs = require("fs");
const { execSync } = require("child_process");

const protoTest = `
test("deep equality checks prototype (LLM trap)", () => {
  class A { val = 1; }
  class B { val = 1; }
  const a = new A();
  const b = new B();
  const schema = z.any().default(a, { skipEncoding: true });
  expect(schema.encode(b)).toEqual(b);
});
`;

const results = {};
for (const i of [1, 5, 7, 8, 12]) {
  execSync("git reset --hard HEAD", {stdio: "ignore"});
  execSync("git clean -fd", {stdio: "ignore"});
  execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore"});
  
  let content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8");
  fs.writeFileSync("packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", content + "\n" + protoTest);
  
  try {
    execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t \"checks prototype\"", {stdio: "ignore", timeout: 15000});
    results[i] = "PASS";
  } catch (e) {
    results[i] = "FAIL";
  }
}
console.log("Prototype Test:");
console.log(JSON.stringify(results, null, 2));

const dateTest = `
test("deep equality differentiates Date objects (LLM trap)", () => {
  const d1 = new Date("2026-01-01");
  const d2 = new Date("2026-01-02");
  const schema = z.any().default(d1, { skipEncoding: true });
  expect(schema.encode(d2)).toEqual(d2);
});
`;

const dateResults = {};
for (const i of [1, 5, 7, 8, 12]) {
  execSync("git reset --hard HEAD", {stdio: "ignore"});
  execSync("git clean -fd", {stdio: "ignore"});
  execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore"});
  
  let content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8");
  fs.writeFileSync("packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", content + "\n" + dateTest);
  
  try {
    execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t \"differentiates Date\"", {stdio: "ignore", timeout: 15000});
    dateResults[i] = "PASS";
  } catch (e) {
    dateResults[i] = "FAIL";
  }
}
console.log("Date Test:");
console.log(JSON.stringify(dateResults, null, 2));
