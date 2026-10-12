const fs = require("fs");
const { execSync } = require("child_process");

// All 5 passing agents pass the shallow Map test. The T4 addition won't eliminate any.
// We need to drop one more passing agent from the 5 currently passing (1, 5, 7, 8, 12).
// Options:
// 1. Add sparse-array hole equivalence test to check the correct implementation of deepEqual for sparse arrays
// 2. Check which of the 5 agents fails the sparse array test

const sparseTest = `
test("deep equality distinguishes sparse holes from undefined (T4 variant)", () => {
  const arr1: any[] = [1, , 3]; // sparse hole at index 1
  const arr2: any[] = [1, undefined, 3]; // explicit undefined
  const schema = z.any().default(arr1, { skipEncoding: true });
  // sparse[1] != undefined[1] -> should NOT be equal -> should not omit
  expect(z.object({ a: schema }).encode({ a: arr2 })).toEqual({ a: arr2 });
});
`;

const results = {};
for (const i of [1, 5, 7, 8, 12]) {
  console.log("Testing Agent " + i);
  execSync("git reset --hard HEAD", {stdio: "ignore"});
  execSync("git clean -fd", {stdio: "ignore"});
  execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore"});
  
  let content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8");
  fs.writeFileSync("packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", content + "\n" + sparseTest);
  
  try {
    execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t \"sparse holes\"", {stdio: "ignore", timeout: 15000});
    results[i] = "PASS";
  } catch (e) {
    results[i] = "FAIL";
  }
}
console.log(JSON.stringify(results, null, 2));
