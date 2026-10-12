const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';

const tests = [
  {
    name: 'Container_Set_Default',
    code: `
test("container-level default on Set inside object", () => {
  const defaultSet = new Set([1, 2]);
  const schema = z.object({
    s: z.set(z.number()).default(defaultSet, { skipEncoding: true }),
  });
  expect(schema.encode({ s: new Set([2, 1]) })).toEqual({});
  expect(schema.encode({ s: new Set([1, 3]) })).toEqual({ s: new Set([1, 3]) });
});
`
  },
  {
    name: 'Container_Map_Default',
    code: `
test("container-level default on Map inside object", () => {
  const defaultMap = new Map([["a", 1], ["b", 2]]);
  const schema = z.object({
    m: z.map(z.string(), z.number()).default(defaultMap, { skipEncoding: true }),
  });
  expect(schema.encode({ m: new Map([["b", 2], ["a", 1]]) })).toEqual({});
  expect(schema.encode({ m: new Map([["a", 1], ["b", 3]]) })).toEqual({ m: new Map([["a", 1], ["b", 3]]) });
});
`
  },
  {
    name: 'Record_Default_Key_Omission',
    code: `
test("Record with key schema default omission", () => {
  const schema = z.record(
    z.string().default("defKey", { skipEncoding: true }),
    z.number()
  );
  // Key matches default -> omitted from record
  expect(schema.encode({ defKey: 100, otherKey: 200 })).toEqual({ otherKey: 200 });
});
`
  },
  {
    name: 'Array_Default_Element_Omission',
    code: `
test("Array with default element omission preserves remaining elements order", () => {
  const schema = z.array(z.string().default("skip", { skipEncoding: true }));
  expect(schema.encode(["a", "skip", "b", "skip", "c"])).toEqual(["a", "b", "c"]);
});
`
  },
  {
    name: 'Set_Deep_Equal_With_Dates',
    code: `
test("Set deep equality with Date objects order-independent", () => {
  const d1 = new Date(1000);
  const d2 = new Date(2000);
  const schema = z.object({
    s: z.set(z.date()).default(new Set([d1, d2]), { skipEncoding: true }),
  });
  // New Date instances with identical timestamps in reverse order
  expect(schema.encode({ s: new Set([new Date(2000), new Date(1000)]) })).toEqual({});
  expect(schema.encode({ s: new Set([new Date(2000), new Date(3000)]) })).not.toEqual({});
});
`
  },
  {
    name: 'Map_Deep_Equal_With_Nested_Sets',
    code: `
test("Map deep equality with nested Set values", () => {
  const schema = z.object({
    m: z.map(z.string(), z.set(z.number())).default(
      new Map([["k", new Set([1, 2])]]),
      { skipEncoding: true }
    ),
  });
  expect(schema.encode({ m: new Map([["k", new Set([2, 1])]]) })).toEqual({});
  expect(schema.encode({ m: new Map([["k", new Set([1, 3])]]) })).not.toEqual({});
});
`
  }
];

const specPath = path.join(ZOD_DIR, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts');
const baseSpec = fs.readFileSync(specPath, 'utf8');

for (const t of tests) {
  console.log('\n========================================');
  console.log('Testing: ' + t.name);
  console.log('========================================');
  const modifiedSpec = baseSpec + '\n' + t.code;

  for (const agentId of [5, 8, 10, 11, 'solution']) {
    execSync('git reset --hard HEAD', { cwd: ZOD_DIR, stdio: 'pipe' });
    execSync('git clean -fd', { cwd: ZOD_DIR, stdio: 'pipe' });

    if (agentId === 'solution') {
      execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/MAA/solution.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
    } else {
      const p = path.join(AGENT_DIR, 'Nova_Nova_' + agentId, 'solution-patch.patch');
      let txt = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
      const tmp = path.join(ZOD_DIR, '_tmp.patch');
      fs.writeFileSync(tmp, txt, 'utf8');
      execSync('git apply --whitespace=fix _tmp.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
    }

    fs.writeFileSync(specPath, modifiedSpec, 'utf8');

    try {
      execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', {
        cwd: ZOD_DIR,
        stdio: 'pipe',
        timeout: 30000
      });
      console.log('  Agent ' + agentId + ': PASS');
    } catch (err) {
      console.log('  Agent ' + agentId + ': FAIL');
    }
  }
}
