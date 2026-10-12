const fs = require("fs");
const { execSync } = require("child_process");

// Agents 1, 5, 7, 8, 12 pass (5 agents) - need to eliminate 1 or 2 more.
// The shallow Map tests should have knocked out Agent 7 which passed the previous round but 
// didn't implement shallow Map correctly. Let's check specifically which agents pass the shallow Map tests.

const shallowMapTest = `
test("shallow equality mode for Maps (positive: same instances match)", () => {
  const keyObj = { k: 1 };
  const valObj = { v: 2 };
  const mapDefault = new Map([[keyObj, valObj]]);
  const schema = z.object({
    m: z.any().default(mapDefault, { skipEncoding: { mode: "shallow" } }),
  });
  expect(schema.encode({ m: new Map([[keyObj, valObj]]) })).toEqual({});
});

test("shallow equality mode for Maps (negative: structurally same but distinct instances do not match)", () => {
  const keyObj = { k: 1 };
  const valObj = { v: 2 };
  const mapDefault = new Map([[keyObj, valObj]]);
  const schema = z.object({
    m: z.any().default(mapDefault, { skipEncoding: { mode: "shallow" } }),
  });
  const distinctMap = new Map([[{ k: 1 }, { v: 2 }]]);
  expect(schema.encode({ m: distinctMap })).toEqual({ m: distinctMap });
});
`;

const results = {};
for (const i of [1, 5, 7, 8, 12]) {
  console.log("Testing Agent " + i);
  execSync("git reset --hard HEAD", {stdio: "ignore"});
  execSync("git clean -fd", {stdio: "ignore"});
  execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore"});
  
  let content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8");
  fs.writeFileSync("packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", content + "\n" + shallowMapTest);
  
  try {
    execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t \"shallow equality mode for Maps\"", {stdio: "ignore", timeout: 15000});
    results[i] = "PASS";
  } catch (e) {
    results[i] = "FAIL";
  }
}
console.log(JSON.stringify(results, null, 2));
