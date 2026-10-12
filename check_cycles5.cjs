const fs = require("fs");
const { execSync } = require("child_process");

execSync("git reset --hard HEAD", {stdio: "ignore"});
execSync("git clean -fd", {stdio: "ignore"});
execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_5/solution-patch.patch"`, {stdio: "ignore"});

let base = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8");
const newTests = `
test("discriminator: crash on cycles", () => {
  const a: any = {}; a.next = a;
  const b: any = { next: {} }; b.next.next = b;
  const schema = z.object({ s: z.any().default(a, { skipEncoding: true }) });
  expect(schema.encode({ s: b })).toEqual({}); 
});
`;
fs.writeFileSync("packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", base + "\n" + newTests);

try {
  const out = execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t \"crash on cycles\" 2>&1", {stdio: "pipe", timeout: 10000}).toString();
  console.log("PASS:", out.includes("✓"));
} catch(e) {
  console.log("FAIL:");
  if (e.code === 'ETIMEDOUT') console.log("TIMEOUT");
  else console.log(e.toString());
}
