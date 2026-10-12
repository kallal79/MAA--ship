const { execSync } = require("child_process");

execSync("git reset --hard HEAD", {stdio: "ignore"});
execSync("git clean -fd", {stdio: "ignore"});
execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_7/solution-patch.patch"`, {stdio: "ignore"});

const code = `
import * as util from './packages/zod/src/v4/core/util.ts';

const O = {val: 1};
const O_copy = {val: 1};
const O2 = {val: 2};
const a = new Set([ O, O_copy ]);
const b = new Set([ O, O2 ]);

console.log("Agent 7 deepEqual(a, b):", util.util.deepEqual(a, b));
`;
require("fs").writeFileSync("test_agent_7.ts", code);
try {
  const out = execSync("pnpm exec tsx test_agent_7.ts").toString();
  console.log(out);
} catch(e) {
  console.log(e.toString());
}
