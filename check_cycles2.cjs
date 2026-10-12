const fs = require("fs");
const { execSync } = require("child_process");

const cycleMapTest = `
test("discriminator: crash on Map cycles (LLM trap)", () => {
  const a = new Map(); a.set("next", a);
  const b = new Map(); const inner = new Map(); inner.set("next", b); b.set("next", inner);
  const schema = z.object({ s: z.any().default(a, { skipEncoding: true }) });
  expect(schema.encode({ s: b })).toEqual({}); 
});

test("discriminator: crash on Set cycles (LLM trap)", () => {
  const a = new Set(); a.add(a);
  const b = new Set(); const inner = new Set(); inner.add(b); b.add(inner);
  const schema = z.object({ s: z.any().default(a, { skipEncoding: true }) });
  expect(schema.encode({ s: b })).toEqual({});
});
`;

const results = {};
for (const i of [1, 5, 7, 8, 12]) {
  execSync("git reset --hard HEAD", {stdio: "ignore"});
  execSync("git clean -fd", {stdio: "ignore"});
  execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore"});
  
  let content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8");
  fs.writeFileSync("packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", content + "\n" + cycleMapTest);
  
  try {
    execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t \"crash on\"", {stdio: "ignore", timeout: 15000});
    results[i] = "PASS";
  } catch (e) {
    results[i] = "FAIL";
  }
}
console.log("Map/Set Cycle Test:");
console.log(JSON.stringify(results, null, 2));
