const fs = require("fs");
const { execSync } = require("child_process");

// P4 issue: the problem description in the AGENTS.md does not describe shallow mode for Maps/Sets.
// This is a problem description text issue - we need to check what's in the problem statement patch.
// The problem statement patch = the test patch (per the Olympus platform convention)
// But actually: the "problem description" is separate from the test patch.
// Let us verify the shallowEqual implementation for Maps and Sets to understand P4.

const t4SetTest = `
import { z } from './packages/zod/src/index.ts';

// T4: Shallow Set equality  
const elemA = { k: 1 };
const elemB = { k: 2 };
const setA = new Set([elemA, elemB]);

const schema = z.any().default(setA, { skipEncoding: { mode: "shallow" } });

// Same instances - should match
console.log("shallow set - same instances:", JSON.stringify(z.object({ s: schema }).encode({ s: setA }))); // {}

// Different instances, structurally same
const setB = new Set([{ k: 1 }, { k: 2 }]);
console.log("shallow set - diff instances:", JSON.stringify(z.object({ s: schema }).encode({ s: setB }))); // should NOT be {}
`;

fs.writeFileSync("test_t4set.ts", t4SetTest);
try {
  const out = execSync("pnpm exec tsx test_t4set.ts", {timeout: 15000}).toString();
  console.log(out);
} catch(e) {
  console.log("ERROR:", e.toString().substring(0, 3000));
}
