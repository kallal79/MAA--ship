const fs = require("fs");
const { execSync } = require("child_process");

const tests = `
test("discriminator: many-to-one Set", () => {
  const O = {val: 1};
  const O_copy = {val: 1};
  const O2 = {val: 2};
  // a has two identical elements (deep equal)
  const a = new Set([ O, O_copy ]);
  // b has only one element that matches O, the other is O2
  const b = new Set([ O, O2 ]);
  
  // They are same size, but different sets!
  const schema = z.any().default(a, { skipEncoding: true });
  expect(schema.encode({ s: b })).toEqual({ s: b }); 
});
`;

const results = {};

for (const i of [1, 5, 7, 8, 12]) {
  console.log("Testing Agent " + i);
  execSync("git reset --hard HEAD", {stdio: "ignore"});
  execSync("git clean -fd", {stdio: "ignore"});
  
  try {
    execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore"});
  } catch (e) { continue; }
  
  let content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8");
  fs.writeFileSync("packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", content + "\n" + tests);
  
  try {
    execSync(`pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t "many-to-one Set"`, {stdio: "ignore", timeout: 15000});
    results[i] = "PASS";
  } catch (e) {
    results[i] = "FAIL";
  }
}
console.log(JSON.stringify(results, null, 2));
