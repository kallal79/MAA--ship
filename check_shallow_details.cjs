const fs = require("fs");
const { execSync } = require("child_process");

// Agent 5's compareMembers: when deep=false (shallow mode), it uses "Object.is" for all comparisons.
// For Map shallow: it calls matchUnordered([...a], [...b], ([ak, av], [bk, bv]) => compare(ak, bk) && compare(av, bv))
// In shallow mode, compare = Object.is.
// So shallow Map comparison: each [key, value] pair from a must match a pair from b with Object.is(key, bKey) && Object.is(value, bValue)
// This uses matchUnordered which does bipartite matching!
// With same key/value instances: Object.is(keyObj, keyObj) = true, Object.is(valObj, valObj) = true -> MATCH
// With distinct instances: Object.is({k:1}, {k:1}) = false -> NO MATCH
// So Agent 5 handles shallow Map correctly (same instances match, distinct don't)!

// Now let me test a specific edge case for shallow Sets in Agent 5
// Shallow Set: uses matchUnordered with Object.is
// same-instance Set elements: Object.is(elemA, elemA) = true -> match
// distinct-instance Set elements: Object.is({k:1}, {k:1}) = false -> no match
// Agent 5 shallow Set should work correctly too.

// Let me instead test something that differentiates the 5 remaining agents.
// What about testing the specific behavior where Agent 5 differs from 1/7/8/12?

// Let me run a quick behavioral comparison on all 5 agents for the shallow Map negative case
const shellScript = `
import { z } from './packages/zod/src/index.ts';

const keyObj = { k: 1 };
const valObj = { v: 2 };
const mapDefault = new Map([[keyObj, valObj]]);
const schema = z.object({
  m: z.any().default(mapDefault, { skipEncoding: { mode: "shallow" } }),
});

// Negative: different key instance (shallow should NOT match)
const mapDiffKey = new Map([[{ k: 1 }, valObj]]);
console.log("shallow map diff key:", JSON.stringify(schema.encode({ m: mapDiffKey })));

// Negative: different value instance  
const mapDiffVal = new Map([[keyObj, { v: 2 }]]);
console.log("shallow map diff val:", JSON.stringify(schema.encode({ m: mapDiffVal })));

// Positive: same instances
const mapSame = new Map([[keyObj, valObj]]);
console.log("shallow map same:", JSON.stringify(schema.encode({ m: mapSame })));
`;

fs.writeFileSync("test_shallow.ts", shellScript);
try {
  const out = execSync("pnpm exec tsx test_shallow.ts", {timeout: 15000}).toString();
  console.log(out);
} catch(e) {
  console.log("ERROR:", e.toString().substring(0, 2000));
}
