const fs = require("fs");
const { execSync } = require("child_process");

// Perfect! Agent 5's shallow Map:
// - same instances: {} (omitted) CORRECT
// - diff key instance: {"m":{}} (NOT omitted) CORRECT  
// - diff val instance: {"m":{}} (NOT omitted) CORRECT

// But my new test says "same key & value instances match" and "distinct instances do NOT match"
// These are correct in Agent 5!

// Wait, the test IS passing for Agent 5 according to our earlier runs. So all 5 agents pass the shallow Map test.
// The issue: We need to go from 5 passes to 3-4 passes.
// The review says: T4: "No test for shallow Map equality" - but adding such a test doesn't help because
// all 5 agents implement it correctly.

// New strategy: Instead of trying to eliminate more agents via the test patch,
// the review issues that matter for the SOLUTION patch are S1 and S2.
// S1 is the real correctness bug that was identified.
// Adding the S1 fix to the SOLUTION patch means:
//   - Our reference solution handles chained defaults correctly
//   - Agents that don't have S1 fix would fail a corresponding test
//   - But we showed ALL agents fail the S1 test because they all have the S1 bug

// The way Olympus works:
// - TEST PATCH = what tests are added to evaluate agents
// - SOLUTION PATCH = the reference implementation / the fix 
// - Nova agents are evaluated against TEST PATCH only (not our solution)
// - The solution patch must pass all tests when applied

// So the correct approach is:
// 1. The test patch defines what tests to run
// 2. Each Nova agent's solution patch is applied and tested against those tests
// 3. Our solution patch must correctly pass all those tests

// Currently: 5/12 agents pass the test patch (too many)
// We need 3-4/12 agents to pass.
// The 5 passing agents are: 1, 5, 7, 8, 12.
// We need to find tests that make 1-2 of these fail WITHOUT making our reference solution fail.

// Let me check which specific tests the SOLUTION PATCH (Agent 1's solution + S1 fix) passes.
// Actually no - let me re-examine what the test patch should contain.
// The CURRENT state:
// FINAL_TEST_PATCH = 45 base + 5 new = 50 tests
// FINAL_SOLUTION = Agent 1's solution + S1 fix
// Current run: 5 agents pass (1, 5, 7, 8, 12) - NEED TO REDUCE TO 3-4

// I need to find a test that:
// - Our reference solution passes
// - Fails EXACTLY 1-2 of agents 5, 7, 8 (since we want to keep ~3-4 agents passing)

// Let me check for behavioral differences between Agent 5 and the others
// Agent 5's compareMembers uses matchUnordered for bipartite matching
// This is more correct than the simple approaches

// Let me test a specific behavioral case: nested Set in Map (deep comparison)
const nestedSetMapTest = `
import { z } from './packages/zod/src/index.ts';

// Test nested structures: Map of Sets
const set1 = new Set([{ a: 1 }]);
const set2 = new Set([{ a: 1 }]);
const mapDefault = new Map([["key", set1]]);
const inputMap = new Map([["key", set2]]);

const schema = z.object({
  m: z.any().default(mapDefault, { skipEncoding: true })
});

// Deep: both sets contain objects with same structure -> should be equal (omit)
console.log("nested Set in Map:", JSON.stringify(schema.encode({ m: inputMap })));
`;

fs.writeFileSync("test_nested.ts", nestedSetMapTest);
try {
  const out = execSync("pnpm exec tsx test_nested.ts", {timeout: 15000}).toString();
  console.log("Agent 5 nested Set in Map:", out);
} catch(e) {
  console.log("ERROR:", e.toString().substring(0, 2000));
}
