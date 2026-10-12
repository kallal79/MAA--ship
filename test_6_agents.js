const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';
const passingAgents = [4, 5, 6, 7, 9, 12];

const testCases = [
  {
    name: 'T_Tuple_Middle_Removal',
    code: `
test("tuple middle removal compacts array", () => {
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
    name: 'T_Tuple_All_Omitted',
    code: `
test("tuple with all elements omitted produces empty array", () => {
  const schema = z.tuple([
    z.number().default(1, { skipEncoding: true }),
    z.number().default(2, { skipEncoding: true }),
  ]);
  expect(schema.encode([1, 2])).toEqual([]);
});`
  },
  {
    name: 'T_Set_Bipartite_Duplicate_Target',
    code: `
test("Set deep equality bipartite duplicate target", () => {
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
    name: 'T_Nested_Record_Omission',
    code: `
test("nested record omission drops empty inner records if defaulted", () => {
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
    name: 'T_Map_Shallow_Identity',
    code: `
test("Map shallow mode compares keys and values by identity", () => {
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
    name: 'T_Set_Shallow_Identity',
    code: `
test("Set shallow mode compares elements by identity", () => {
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
    name: 'T_Map_Key_Schema_Omission',
    code: `
test("Map key schema default omission drops entry", () => {
  const schema = z.map(
    z.string().default("skipKey", { skipEncoding: true }),
    z.number()
  );
  const m = new Map([["skipKey", 1], ["keepKey", 2]]);
  expect(schema.encode(m)).toEqual(new Map([["keepKey", 2]]));
});`
  },
  {
    name: 'T_Nullish_Wrapper_Transparency',
    code: `
test("nullish wrapper transparency", () => {
  const schema = z.object({
    a: z.string().default("foo", { skipEncoding: true }).nullish(),
  });
  expect(schema.encode({ a: "foo" })).toEqual({});
  expect(schema.encode({ a: null })).toEqual({ a: null });
  expect(schema.encode({ a: undefined })).toEqual({});
});`
  },
  {
    name: 'T_Factory_Mode_Object_Error_Message',
    code: `
test("Factory default with mode object includes mode in error", () => {
  expect(() => {
    z.string().default(() => "hi", { skipEncoding: { mode: "deep" } });
  }).toThrow(/Cannot use skipEncoding: {"mode":"deep"} with a factory default/);
});`
  },
  {
    name: 'T_Date_Object_Negative_Timestamp',
    code: `
test("Date object comparison by timestamp with negative timestamps", () => {
  const schema = z.object({
    d: z.date().default(new Date(-1000), { skipEncoding: true }),
  });
  expect(schema.encode({ d: new Date(-1000) })).toEqual({});
  expect(schema.encode({ d: new Date(1000) })).toEqual({ d: new Date(1000) });
});`
  },
  {
    name: 'T_Strict_Mode_Map',
    code: `
test("Strict mode on Map compares by reference", () => {
  const m1 = new Map([["a", 1]]);
  const schema = z.object({
    m: z.map(z.string(), z.number()).default(m1, { skipEncoding: { mode: "strict" } }),
  });
  expect(schema.encode({ m: m1 })).toEqual({});
  expect(schema.encode({ m: new Map([["a", 1]]) })).toEqual({ m: new Map([["a", 1]]) });
});`
  },
  {
    name: 'T_Strict_Mode_Set',
    code: `
test("Strict mode on Set compares by reference", () => {
  const s1 = new Set([1, 2]);
  const schema = z.object({
    s: z.set(z.number()).default(s1, { skipEncoding: { mode: "strict" } }),
  });
  expect(schema.encode({ s: s1 })).toEqual({});
  expect(schema.encode({ s: new Set([1, 2]) })).toEqual({ s: new Set([1, 2]) });
});`
  }
];

const results = {};

for (const t of testCases) {
  results[t.name] = {};
  for (const agentId of [...passingAgents, 'solution']) {
    execSync('git reset --hard HEAD', { cwd: ZOD_DIR, stdio: 'pipe' });
    execSync('git clean -fd', { cwd: ZOD_DIR, stdio: 'pipe' });

    if (agentId === 'solution') {
      execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/solution.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
    } else {
      const p = path.join(AGENT_DIR, 'Nova_Nova_' + agentId, 'solution-patch.patch');
      let txt = fs.readFileSync(p, 'utf8').replace(/\\r\\n/g, '\\n');
      const tmp = path.join(ZOD_DIR, '_tmp.patch');
      fs.writeFileSync(tmp, txt, 'utf8');
      execSync('git apply --whitespace=fix _tmp.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
      fs.unlinkSync(tmp);
    }

    const testFile = 'import { expect, test } from "vitest";\\nimport { z } from "../../../index.js";\\n' + t.code + '\\n';
    const specPath = path.join(ZOD_DIR, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts');
    fs.writeFileSync(specPath, testFile, 'utf8');

    try {
      execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', {
        cwd: ZOD_DIR,
        stdio: 'pipe',
        timeout: 10000
      });
      results[t.name][agentId] = 'PASS';
    } catch (e) {
      results[t.name][agentId] = 'FAIL';
    }
  }
}

console.log('\\n================ RESULTS ON CANDIDATE TESTS ================');
console.log('Test Name'.padEnd(35) + ' | ' + [...passingAgents, 'solution'].map(x => String(x).padEnd(6)).join(' | '));
console.log('-'.repeat(85));
for (const t of testCases) {
  const row = [t.name.padEnd(35)];
  for (const a of [...passingAgents, 'solution']) {
    row.push((results[t.name][a] || 'FAIL').padEnd(6));
  }
  console.log(row.join(' | '));
}
