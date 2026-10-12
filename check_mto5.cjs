const fs = require("fs");
const { execSync } = require("child_process");

// Agent 5 ALSO PASSES the old 3 discriminators! So Agent 5 was always passing.
// But the previous round showed Agent 5 as FAIL with the previous test patch?
// 
// Let me trace back: The task-3322 evaluation with the FIRST valid test patch showed:
// "1": "PASS", "2": "FAIL", "3": "FAIL", "4": "FAIL", "5": "PASS", "6": "FAIL", "7": "PASS",
// "8": "PASS", "9": "FAIL", "10": "FAIL", "11": "FAIL", "12": "PASS"
// -> 5 passes (1, 5, 7, 8, 12)
//
// Then we added "many-to-one Set" test and ran task-3380:  
// "5": "FAIL (TIMEOUT / INFINITE LOOP)" - Agent 5 TIMED OUT on many-to-one Set!
// So Agent 5 has a TIMEOUT issue on many-to-one Set!
// But now it PASSES? Something changed...
// 
// Oh wait - we're using DIFFERENT test patches now.
// The current FINAL_TEST_PATCH_TO_UPLOAD.patch was rebuilt fresh with:
// 45 base + shallow map pos + shallow map neg + crash on cycles + Set deep eq + many-to-one Set
// And Agent 5 passes this?! But it used to timeout on many-to-one Set!
//
// The issue might be that the many-to-one Set test uses [O, O_copy] = [{val:1}, {val:1}]
// In a real Set, you can't have duplicate elements by reference - Set uses SameValueZero
// O and O_copy are DIFFERENT OBJECTS (different references) so they CAN both be in the Set!
// a = new Set([O, O_copy]) -> size 2 because O !== O_copy
// b = new Set([O, O2]) -> size 2 because O !== O2
//
// Wait, but Agent 5 uses matchUnordered which is bipartite matching!
// In the many-to-one test:
// Default: a = {val:1}, {val:1} -> 2 elements
// Input: b = {val:1}, {val:2} -> 2 elements
// Agent 5 matchUnordered tries to match each element in a to a unique element in b:
//   - {val:1} -> can it match {val:1}? YES
//   - {val:1} -> can it match {val:2}? NO -> FAIL overall
// So Agent 5 CORRECTLY says these sets are NOT equal!
// That means schema.encode({s:b}) returns {s:b} (not omitted)
// That's the EXPECTED behavior! So Agent 5 PASSES the many-to-one test correctly!
//
// But in the previous run (task-3380), Agent 5 timed out! Why?
// The timeout might have been because Agent 5's matchUnordered implementation was different then...
// Or maybe the test was timing out for a DIFFERENT reason.
//
// Let me verify Agent 5's matchUnordered can't infinite loop:

const matchTest = `
import { z } from './packages/zod/src/index.ts';
const O = {val: 1};
const O_copy = {val: 1};
const O2 = {val: 2};
const a = new Set([ O, O_copy ]);
const b = new Set([ O, O2 ]);
const schema = z.object({ s: z.any().default(a, { skipEncoding: true }) });
console.log("Result:", JSON.stringify(schema.encode({ s: b })));
`;

execSync("git reset --hard HEAD", {stdio: "ignore"});
execSync("git clean -fd", {stdio: "ignore"});
execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_5/solution-patch.patch"`, {stdio: "ignore"});

fs.writeFileSync("test_mto.ts", matchTest);
try {
  const out = execSync("pnpm exec tsx test_mto.ts", {timeout: 15000}).toString();
  console.log(out);
} catch(e) {
  if (e.code === 'ETIMEDOUT') {
    console.log("TIMEOUT - Agent 5 has infinite loop!");
  } else {
    console.log("ERROR:", e.toString().substring(0, 1000));
  }
}
