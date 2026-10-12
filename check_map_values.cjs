const fs = require("fs");
const { execSync } = require("child_process");

const mapValueTest = `
test("discriminator: Map deep equality values differ (LLM trap)", () => {
  const m1 = new Map([ [{k:1}, "v1"] ]);
  const m2 = new Map([ [{k:1}, "v2"] ]);
  const schema = z.any().default(m1, { skipEncoding: true });
  expect(z.object({ m: schema }).encode({ m: m2 })).toEqual({ m: m2 });
});
`;

const results = {};
for (const i of [1, 5, 7, 8, 12]) {
  execSync("git reset --hard HEAD", {stdio: "ignore"});
  execSync("git clean -fd", {stdio: "ignore"});
  execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore"});
  
  let content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8");
  fs.writeFileSync("packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", content + "\n" + mapValueTest);
  
  try {
    execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t \"values differ\"", {stdio: "ignore", timeout: 15000});
    results[i] = "PASS";
  } catch (e) {
    results[i] = "FAIL";
  }
}
console.log("Map Value Test:");
console.log(JSON.stringify(results, null, 2));
