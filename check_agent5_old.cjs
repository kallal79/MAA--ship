const fs = require("fs");
const { execSync } = require("child_process");

// Take a step back. We have 5 agents passing when we need 3-4.
// Review carefully: The review issues were:
// S1: Bug in nested defaults  
// S2: JIT optimization unnecessary (performance, not correctness)
// T3: Bipartite matching test already correct
// T4: Shallow Map test missing  
// P4: Description of shallow mode for Map/Set semantics

// The T4 shallow Map tests don't discriminate because all agents handle it correctly.
// The S1 fix in solution is correct behavior per the review.

// Key question: Is it acceptable to have 5/12 (41.7%) as pass rate?
// The requirement is "pass rate must be ≤50%" which is SATISFIED (5/12 = 41.7% < 50%)!
// And "3 or 4 Nova agents have to pass" - the user's instruction said "3 OR 4"

// But 5 is not 3 or 4. So we DO need to get to 3-4.

// The cleanest solution: The "chained defaults" (S1) test fails all agents.
// But we need ~8-9 agents to fail (out of 12) and 3-4 to pass.
// 
// What if we weaken the S1 test so only 1-2 agents fail it?
// No agent currently passes S1, so we can't use it as a discriminator.

// Alternative: Look at what made the last evaluation result in 5 passes when
// the PREVIOUS evaluation with 3 discriminators yielded 4 passes.
// The previous discriminators were: crash on cycles, Set element deep equality, many-to-one Set
// Results: Agents 1, 7, 8, 12 passed (4 passes)
// Current discriminators (5 tests): same 3 + shallow Map pos + shallow Map neg
// Results: Agents 1, 5, 7, 8, 12 pass (5 passes)

// The shallow Map tests ADDED a passing agent (Agent 5) instead of removing one!
// Agent 5 was FAILING before (it couldn't pass the many-to-one Set test)
// But now it passes because... wait. Let me re-check.

// In the VERY FIRST round (3 discriminators only):
// "1": "PASS", "3": "FAIL", "5": "PASS", "7": "PASS", "8": "PASS", "12": "PASS" -> 5 passes
// Then we added "many-to-one Set" to get 4 passes (dropping Agent 7)
// But Agent 7 passes the shallow Map test...
// And now with shallow Map tests added, we're back to 5 passes?

// Wait - I need to recheck. The current test patch has 50 tests:
// 45 base + shallow Map pos + shallow Map neg + crash on cycles + Set deep eq + many-to-one Set
// And the results show 5 agents pass (1, 5, 7, 8, 12)

// The PREVIOUS test patch had:
// 45 base + crash on cycles + Set deep eq + many-to-one Set = 48 tests
// Results: 4 passes (1, 7, 8, 12)

// So Agent 5 was FAILING with the previous test patch (no shallow Map tests)
// But Agent 5 PASSES with current test patch (which includes shallow Map tests)
// That means the shallow Map tests HELPED Agent 5 pass (it was failing something in the base + 3 discriminators)
// Wait no - the new shallow Map tests should only ADD tests, not remove failing ones...

// Unless the issue is that Agent 5 was failing the "many-to-one Set" test in the original discriminator round
// but now it passes because some change was made?

// Let me re-verify by applying the old test patch to Agent 5
const oldTests = `
test("discriminator: crash on cycles", () => {
  const a: any = {}; a.next = a;
  const b: any = { next: {} }; b.next.next = b;
  const schema = z.object({ s: z.any().default(a, { skipEncoding: true }) });
  expect(schema.encode({ s: b })).toEqual({}); 
});

test("discriminator: Set element deep equality", () => {
  const schema = z.any().default(new Set([{a: 1}]), { skipEncoding: true });
  expect(z.object({ s: schema }).encode({ s: new Set([{a: 1}]) })).toEqual({});
});

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

execSync("git reset --hard HEAD", {stdio: "ignore"});
execSync("git clean -fd", {stdio: "ignore"});
execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_5/solution-patch.patch"`, {stdio: "ignore"});

let base = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8");
fs.writeFileSync("packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", base + "\n" + oldTests);

try {
  execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false", {stdio: "ignore", timeout: 15000});
  console.log("Agent 5: PASS (old 3 discriminators)");
} catch(e) {
  console.log("Agent 5: FAIL (old 3 discriminators)");
  const stdout = e.stdout?.toString() || "";
  // Get failing tests
  const failLines = stdout.split('\n').filter(l => l.includes('FAIL') || l.includes('AssertionError'));
  console.log("Failures:", failLines.slice(0, 10).join('\n'));
}
