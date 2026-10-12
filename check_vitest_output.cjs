const fs = require("fs");
const { execSync } = require("child_process");

execSync("git reset --hard HEAD", {stdio: "ignore"});
execSync("git clean -fd", {stdio: "ignore"});
execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_5/solution-patch.patch"`, {stdio: "ignore"});

let base = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8");
const newTests = `
test("discriminator: many-to-one Set", () => {
  const O = {val: 1};
  const O_copy = {val: 1};
  const O2 = {val: 2};
  const a = new Set([ O, O_copy ]);
  const b = new Set([ O, O2 ]);
  const schema = z.object({ s: z.any().default(a, { skipEncoding: true }) });
  expect(schema.encode({ s: b })).toEqual({ s: b }); 
});
`;
fs.writeFileSync("packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", base + "\n" + newTests);

try {
  const out = execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t \"many-to-one Set\" 2>&1", {stdio: "pipe", timeout: 15000}).toString();
  console.log(out);
} catch(e) {
  const stdout = e.stdout?.toString() || e.toString();
  console.log("FAILED:");
  console.log(stdout);
}
