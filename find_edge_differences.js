const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';

const edgeCases = [
  {
    name: 'sparse_array_dense_conversion',
    code: `
test("sparse array with holes preserves hole structure or undefined", () => {
  const schema = z.array(z.number().default(99, { skipEncoding: true }));
  const arr = [];
  arr[0] = 1;
  arr[2] = 99; // should be dropped
  arr[3] = 3;
  // Encoded array should be [1, 3] or [1, undefined, 3]
  expect(schema.encode(arr)).toEqual([1, 3]);
});`
  },
  {
    name: 'map_with_date_keys',
    code: `
test("map with date keys and defaults", () => {
  const d1 = new Date(100);
  const d2 = new Date(100);
  const schema = z.map(z.date(), z.number().default(0, { skipEncoding: true }));
  const m = new Map([[d1, 0], [new Date(200), 1]]);
  expect(schema.encode(m)).toEqual(new Map([[new Date(200), 1]]));
});`
  },
  {
    name: 'symbol_keyed_objects',
    code: `
test("object with symbol keys preserves non-default symbol keys", () => {
  const sym = Symbol("test");
  const schema = z.object({
    [sym]: z.number().default(0, { skipEncoding: true }),
    a: z.number().default(0, { skipEncoding: true }),
  });
  expect(schema.encode({ [sym]: 0, a: 0 })).toEqual({});
  expect(schema.encode({ [sym]: 1, a: 0 })).toEqual({ [sym]: 1 });
});`
  },
  {
    name: 'set_of_objects_shallow_mode',
    code: `
test("Set with shallow mode compares element identity", () => {
  const obj1 = { a: 1 };
  const obj2 = { a: 1 };
  const schema = z.object({
    s: z.set(z.object({ a: z.number() })).default(new Set([obj1]), {
      skipEncoding: { mode: "shallow" },
    }),
  });
  expect(schema.encode({ s: new Set([obj1]) })).toEqual({});
  expect(schema.encode({ s: new Set([obj2]) })).toEqual({ s: new Set([obj2]) });
});`
  },
  {
    name: 'map_shallow_mode_key_identity',
    code: `
test("Map shallow mode compares both key and value identities", () => {
  const k1 = { id: 1 };
  const v1 = { val: "a" };
  const schema = z.object({
    m: z.map(z.object({ id: z.number() }), z.object({ val: z.string() })).default(
      new Map([[k1, v1]]),
      { skipEncoding: { mode: "shallow" } }
    ),
  });
  expect(schema.encode({ m: new Map([[k1, v1]]) })).toEqual({});
  expect(schema.encode({ m: new Map([[{ id: 1 }, v1]]) })).toEqual({
    m: new Map([[{ id: 1 }, v1]]),
  });
});`
  },
  {
    name: 'circular_or_nested_record',
    code: `
test("nested record with defaults", () => {
  const schema = z.record(
    z.string(),
    z.record(z.string(), z.number().default(0, { skipEncoding: true }))
  );
  expect(schema.encode({ a: { x: 0, y: 1 }, b: { x: 0 } })).toEqual({
    a: { y: 1 },
    b: {},
  });
});`
  },
  {
    name: 'undefined_vs_missing_in_tuple',
    code: `
test("tuple with trailing defaults drops trailing undefined", () => {
  const schema = z.tuple([
    z.string(),
    z.number().default(0, { skipEncoding: true }),
    z.boolean().default(false, { skipEncoding: true }),
  ]);
  expect(schema.encode(["hello", 0, false])).toEqual(["hello"]);
  expect(schema.encode(["hello", 1, false])).toEqual(["hello", 1]);
});`
  },
  {
    name: 'tuple_middle_removal_reindexes',
    code: `
test("tuple middle removal collapses array", () => {
  const schema = z.tuple([
    z.number(),
    z.string().default("omit", { skipEncoding: true }),
    z.number(),
  ]);
  const res = schema.encode([10, "omit", 20]);
  expect(res).toEqual([10, 20]);
  expect(res.length).toBe(2);
});`
  },
  {
    name: 'bipartite_matching_set_cardinality',
    code: `
test("Set deep equality requires 1-to-1 bipartite matching on same cardinality", () => {
  const schema = z.object({
    s: z.set(z.object({ a: z.number() })).default(
      new Set([{ a: 1 }, { a: 2 }]),
      { skipEncoding: true }
    ),
  });
  expect(schema.encode({ s: new Set([{ a: 2 }, { a: 1 }]) })).toEqual({});
  expect(schema.encode({ s: new Set([{ a: 1 }, { a: 1 }]) })).toEqual({
    s: new Set([{ a: 1 }]),
  });
});`
  }
];

const scores = {};
for (const id of [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 'solution']) {
  scores[id] = [];
}

for (const ec of edgeCases) {
  for (const id of [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 'solution']) {
    execSync('git reset --hard HEAD', { cwd: ZOD_DIR, stdio: 'pipe' });
    execSync('git clean -fd', { cwd: ZOD_DIR, stdio: 'pipe' });

    if (id === 'solution') {
      execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/solution.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
    } else {
      const p = path.join(AGENT_DIR, 'Nova_Nova_' + id, 'solution-patch.patch');
      let txt = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
      const tmp = path.join(ZOD_DIR, '_tmp.patch');
      fs.writeFileSync(tmp, txt, 'utf8');
      try {
        execSync('git apply --whitespace=fix _tmp.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
      } catch (e) {
        fs.unlinkSync(tmp);
        continue;
      }
      fs.unlinkSync(tmp);
    }

    const testFile = `import { expect, test } from "vitest";\nimport { z } from "../../../index.js";\n${ec.code}\n`;
    const specPath = path.join(ZOD_DIR, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts');
    fs.writeFileSync(specPath, testFile, 'utf8');

    try {
      execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', {
        cwd: ZOD_DIR,
        stdio: 'pipe',
        timeout: 20000
      });
      scores[id].push(ec.name);
    } catch (e) {}
  }
}

console.log('\n--- SCORES ACROSS CANDIDATES ---');
for (const [k, v] of Object.entries(scores)) {
  console.log(`Agent ${k}: ${v.length}/${edgeCases.length} -> [${v.join(', ')}]`);
}
