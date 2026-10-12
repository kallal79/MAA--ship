const fs = require("fs");
const { execSync } = require("child_process");

const arrayPropTest = `
test("deep equality checks array non-numeric properties (LLM trap)", () => {
  const arr1: any = [1]; arr1.prop = 2;
  const arr2: any = [1]; arr2.prop = 3;
  const schema = z.any().default(arr1, { skipEncoding: true });
  expect(schema.encode(arr2)).toEqual(arr2);
});
`;

const results = {};
for (const i of [1, 5, 7, 8, 12]) {
  execSync("git reset --hard HEAD", {stdio: "ignore"});
  execSync("git clean -fd", {stdio: "ignore"});
  execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore"});
  
  let content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8");
  fs.writeFileSync("packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", content + "\n" + arrayPropTest);
  
  try {
    execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t \"checks array non-numeric properties\"", {stdio: "ignore", timeout: 15000});
    results[i] = "PASS";
  } catch (e) {
    results[i] = "FAIL";
  }
}
console.log("Array Prop Test:");
console.log(JSON.stringify(results, null, 2));
