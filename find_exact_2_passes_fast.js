const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';

const edgeCases = [
  {
    name: 'sparse_array_dense_conversion',
    code: `
test("sparse_array_dense_conversion", () => {
  const schema = z.array(z.number().default(99, { skipEncoding: true }));
  const arr = [];
  arr[0] = 1;
  arr[2] = 99; // should be dropped
  arr[3] = 3;
  expect(schema.encode(arr)).toEqual([1, 3]);
});`
  },
  {
    name: 'map_with_date_keys',
    code: `
test("map_with_date_keys", () => {
  const d1 = new Date(100);
  const schema = z.map(z.date(), z.number().default(0, { skipEncoding: true }));
  const m = new Map([[d1, 0], [new Date(200), 1]]);
  expect(schema.encode(m)).toEqual(new Map([[new Date(200), 1]]));
});`
  },
  {
    name: 'symbol_keyed_objects',
    code: `
test("symbol_keyed_objects", () => {
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
test("set_of_objects_shallow_mode", () => {
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
test("map_shallow_mode_key_identity", () => {
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
test("circular_or_nested_record", () => {
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
test("undefined_vs_missing_in_tuple", () => {
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
test("tuple_middle_removal_reindexes", () => {
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
test("bipartite_matching_set_cardinality", () => {
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
  },
  {
    name: 'predicate_receives_raw_default',
    code: `
test("predicate_receives_raw_default", () => {
  let passedRaw = null;
  const schema = z.string().default("DEFAULT_VAL", {
    skipEncoding: (val, raw) => {
      passedRaw = raw;
      return val === raw;
    }
  });
  schema.encode("DEFAULT_VAL");
  expect(passedRaw).toBe("DEFAULT_VAL");
});`
  },
  {
    name: 'factory_default_boolean_throws',
    code: `
test("factory_default_boolean_throws", () => {
  expect(() => {
    z.string().default(() => "hi", { skipEncoding: true });
  }).toThrow(/factory/i);
});`
  },
  {
    name: 'map_key_default_drops_entry',
    code: `
test("map_key_default_drops_entry", () => {
  const schema = z.map(
    z.string().default("skipKey", { skipEncoding: true }),
    z.number()
  );
  const m = new Map([["skipKey", 1], ["keepKey", 2]]);
  expect(schema.encode(m)).toEqual(new Map([["keepKey", 2]]));
});`
  }
];

const testFileContent = `import { expect, test } from "vitest";
import { z } from "../../../index.js";

${edgeCases.map(ec => ec.code).join('\n')}
`;

const specPath = path.join(ZOD_DIR, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts');

const results = {};

for (const id of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 'solution']) {
  results[id] = {};
  execSync('git reset --hard HEAD', { cwd: ZOD_DIR, stdio: 'pipe' });
  execSync('git clean -fd', { cwd: ZOD_DIR, stdio: 'pipe' });

  if (id === 'solution') {
    execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/solution.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
  } else {
    const p = path.join(AGENT_DIR, 'Nova_Nova_' + id, 'solution-patch.patch');
    if (!fs.existsSync(p)) continue;
    let txt = fs.readFileSync(p, 'utf8').replace(/\\r\\n/g, '\\n');
    const tmp = path.join(ZOD_DIR, '_tmp.patch');
    fs.writeFileSync(tmp, txt, 'utf8');
    try {
      execSync('git apply --whitespace=fix _tmp.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
    } catch (e) {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
      continue;
    }
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  }

  fs.writeFileSync(specPath, testFileContent, 'utf8');

  try {
    const out = execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck --reporter=json', {
      cwd: ZOD_DIR,
      stdio: 'pipe',
      timeout: 30000
    }).toString('utf8');
    const parsed = JSON.parse(out);
    const testResults = parsed.testResults[0].assertionResults;
    for (const tr of testResults) {
      results[id][tr.title] = tr.status; // 'passed' or 'failed'
    }
  } catch (err) {
    if (err.stdout) {
      try {
        const parsed = JSON.parse(err.stdout.toString('utf8'));
        const testResults = parsed.testResults[0].assertionResults;
        for (const tr of testResults) {
          results[id][tr.title] = tr.status;
        }
      } catch (pe) {
        console.error('Failed to parse json for ' + id);
      }
    }
  }
}

console.log('\\n================ MATRIX OF CANDIDATE TESTS ================');
console.log('Test Name | ' + [1,2,3,4,5,6,7,8,9,10,11,12,13,'solution'].join(' | '));
for (const ec of edgeCases) {
  const row = [ec.name];
  for (const id of [1,2,3,4,5,6,7,8,9,10,11,12,13,'solution']) {
    const st = results[id] && results[id][ec.name];
    row.push(st === 'passed' ? 'PASS' : 'FAIL');
  }
  console.log(row.join(' | '));
}

fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/matrix_results.json', JSON.stringify(results, null, 2));
