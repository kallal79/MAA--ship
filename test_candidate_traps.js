const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';

// Tests to evaluate
const candidateTests = [
  {
    name: 'T_Set_NegZero_Shallow',
    code: `
test("Set shallow equality with -0 vs +0", () => {
  const schema = z.object({
    s: z.set(z.number()).default(new Set([-0]), { skipEncoding: { mode: "shallow" } }),
  });
  // +0 is not Object.is with -0, so it should NOT be omitted in shallow mode
  expect(schema.encode({ s: new Set([+0]) })).not.toEqual({});
  // -0 is Object.is with -0, so it SHOULD be omitted
  expect(schema.encode({ s: new Set([-0]) })).toEqual({});
});
`
  },
  {
    name: 'T_Map_NegZero_Shallow',
    code: `
test("Map shallow equality with -0 vs +0 key", () => {
  const schema = z.object({
    m: z.map(z.number(), z.string()).default(new Map([[-0, "val"]]), { skipEncoding: { mode: "shallow" } }),
  });
  // +0 is not Object.is with -0, so it should NOT be omitted in shallow mode
  expect(schema.encode({ m: new Map([[+0, "val"]]) })).not.toEqual({});
  // -0 is Object.is with -0, so it SHOULD be omitted
  expect(schema.encode({ m: new Map([[-0, "val"]]) })).toEqual({});
});
`
  },
  {
    name: 'T_Array_Sparse_Holes',
    code: `
test("Array sparse holes are preserved in deep equality", () => {
  const arr1 = [1, , 3];
  const arr2 = [1, undefined, 3];
  const schema = z.object({
    a: z.any().default(arr1, { skipEncoding: true }),
  });
  // Sparse hole is NOT undefined in Object.prototype.hasOwnProperty
  expect(schema.encode({ a: arr2 })).not.toEqual({});
  expect(schema.encode({ a: [1, , 3] })).toEqual({});
});
`
  },
  {
    name: 'T_NaN_Strict_vs_Shallow',
    code: `
test("NaN in strict mode uses Object.is", () => {
  const schema = z.object({
    n: z.number().default(NaN, { skipEncoding: { mode: "strict" } }),
  });
  expect(schema.encode({ n: NaN })).toEqual({});
  expect(schema.encode({ n: 0 })).toEqual({ n: 0 });
});
`
  },
  {
    name: 'T_Object_Getter_Throw',
    code: `
test("Object deep equality compares own property descriptors", () => {
  const o1 = { a: 1 };
  const o2 = Object.create(o1);
  o2.b = 2;
  const schema = z.object({
    val: z.any().default({ a: 1, b: 2 }, { skipEncoding: true }),
  });
  // o2 only has own property b, a is inherited
  expect(schema.encode({ val: o2 })).not.toEqual({});
});
`
  }
];

// Read current spec
const specPath = path.join(ZOD_DIR, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts');
const baseSpec = fs.readFileSync(specPath, 'utf8');

for (const candidate of candidateTests) {
  console.log(`\n========================================`);
  console.log(`Testing candidate: ${candidate.name}`);
  console.log(`========================================`);

  const modifiedSpec = baseSpec + '\n' + candidate.code;

  for (const agentId of [5, 8, 10, 11, 'solution']) {
    execSync('git reset --hard HEAD', { cwd: ZOD_DIR, stdio: 'pipe' });
    execSync('git clean -fd', { cwd: ZOD_DIR, stdio: 'pipe' });

    // Apply patch
    if (agentId === 'solution') {
      execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/MAA/solution.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
    } else {
      const p = path.join(AGENT_DIR, `Nova_Nova_${agentId}`, 'solution-patch.patch');
      let txt = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
      const tmp = path.join(ZOD_DIR, '_tmp.patch');
      fs.writeFileSync(tmp, txt, 'utf8');
      execSync('git apply --whitespace=fix _tmp.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
    }

    // Write modified spec
    fs.writeFileSync(specPath, modifiedSpec, 'utf8');

    // Run vitest
    try {
      execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', {
        cwd: ZOD_DIR,
        stdio: 'pipe',
        timeout: 30000
      });
      console.log(`  Agent ${agentId}: PASS`);
    } catch (err) {
      console.log(`  Agent ${agentId}: FAIL`);
    }
  }
}
