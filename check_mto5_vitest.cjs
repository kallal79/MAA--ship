const fs = require("fs");
const { execSync } = require("child_process");

// Agent 5 returns {"s":{}} for the many-to-one Set test - this means it says 
// the two Sets ARE equal (and thus OMITS), which is WRONG!
// a = Set[{val:1}, {val:1}], b = Set[{val:1}, {val:2}]
// These are DIFFERENT sets so b should NOT be omitted.
// But Agent 5 returns {} which means it says they're equal. That's a BUG.
// 
// But in the VITEST run, it passes?! The test says:
// expect(schema.encode({ s: b })).toEqual({ s: b }); 
// { s: b } = { s: Set[{val:1}, {val:2}] }
// Agent 5 returns {} which has NO "s" key
// So the test SHOULD fail!
//
// Wait, maybe I'm misunderstanding: 
// schema = z.object({ s: ... })
// schema.encode({s: b}) - this encodes the WHOLE object with key "s"
// If skipEncoding makes s omitted, the WHOLE object becomes {}
// So {} means "s" was omitted (s == default a) -> WRONG because b != a!
// 
// So the test expects {s: b} (not omitted) but Agent 5 returns {} (omitted)
// -> Agent 5 FAILS the test!
//
// But the vitest run showed Agent 5 PASSES... Let me check again more carefully.

// Actually wait. Let me re-read the previous eval output:
// task-3651 showed:
// "5": "PASS"
// But the tsx inline test just showed {"s":{}} which is WRONG!
//
// Oh! I think I understand now. The tsx test might have the wrong schema construction.
// Let me re-run the test exactly as in the vitest test:

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
  if (out.includes("passing") || out.includes("✓")) {
    console.log("Agent 5 PASSES many-to-one Set test");
  } else {
    console.log("Agent 5 output:", out.substring(0, 2000));
  }
} catch(e) {
  const stdout = e.stdout?.toString() || e.toString();
  console.log("Agent 5 FAILS many-to-one Set");
  console.log(stdout.substring(0, 2000));
}
