const fs = require('fs');
const cp = require('child_process');
const repoDir = "C:/Users/USER/OneDrive/Desktop/MAA/zod";
const originalDir = "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-ORIGINAL-ONE";
const finalDir = "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE";

const agentsToTest = [
  { name: 'Original 1', patch: `${originalDir}/Nova_Nova_1/solution-patch.patch` },
  { name: 'Original 2', patch: `${originalDir}/Nova_Nova_2/solution-patch.patch` },
  { name: 'Original 3', patch: `${originalDir}/Nova_Nova_3/solution-patch.patch` },
  { name: 'Final 4', patch: `${finalDir}/Nova_Nova_4/solution-patch.patch` },
  { name: 'Final 9', patch: `${finalDir}/Nova_Nova_9/solution-patch.patch` }
];

const testCases = `const { z } = require('./packages/zod/lib/index.js');

try {
  const inner = z.string().default("inner", { skipEncoding: true });
  const outer = inner.default("outer", { skipEncoding: false });
  const schema = z.object({ val: outer });
  const res = schema.encode({ val: "inner" });
  console.log("T1 OUTPUT:", JSON.stringify(res));
} catch(e) {}

try {
  const arr1 = []; arr1[2] = 1;
  const arr2 = []; arr2[2] = 1;
  const schema = z.object({ a: z.any().default(arr1, { skipEncoding: true }) });
  const res = schema.encode({ a: arr2 });
  console.log("T2 OUTPUT:", JSON.stringify(res));
} catch(e) {}

try {
  const schema = z.object({ s: z.any().default(new Set([Number.NaN]), { skipEncoding: true }) });
  const res = schema.encode({ s: new Set([Number.NaN]) });
  console.log("T3 OUTPUT:", JSON.stringify(res));
} catch(e) {}

try {
  const schema = z.object({
    m: z.map(z.object({ k: z.number() }), z.string()).default(new Map([[{ k: 1 }, "v"]]), { skipEncoding: true }),
  });
  const res = schema.encode({ m: new Map([[{ k: 1 }, "v"]]) });
  console.log("T4 OUTPUT:", JSON.stringify(res));
} catch(e) {}

try {
  const schema = z.object({
    s: z.set(z.object({ a: z.number() })).default(new Set([{ a: 1 }, { a: 2 }]), { skipEncoding: true }),
  });
  const res = schema.encode({ s: new Set([{ a: 1 }, { a: 1 }]) });
  console.log("T5 OUTPUT:", JSON.stringify({ s: Array.from(res.s || []) }));
} catch(e) {}
`;

fs.writeFileSync(`C:/Users/USER/OneDrive/Desktop/MAA/test_script_temp.js`, testCases);

for (const agent of agentsToTest) {
  try {
    cp.execSync('git reset --hard HEAD', { cwd: repoDir, stdio: 'ignore' });
    cp.execSync('git clean -fd', { cwd: repoDir, stdio: 'ignore' });
    cp.execSync(`git apply "${agent.patch}"`, { cwd: repoDir, stdio: 'ignore' });
    cp.execSync('pnpm build', { cwd: repoDir, stdio: 'ignore' });
    
    console.log(`\n=== Testing ${agent.name} ===`);
    const output = cp.execSync('node ../test_script_temp.js', { cwd: repoDir }).toString();
    console.log(output.trim());
  } catch (e) {
    console.log(`Failed to run for ${agent.name}`);
  }
}
