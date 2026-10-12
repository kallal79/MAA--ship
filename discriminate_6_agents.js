const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';
const agents = [4, 5, 6, 7, 9, 12];

const tests = [
  {
    name: 'T_Strict_Map_Reference',
    code: `
test("T_Strict_Map_Reference", () => {
  const m1 = new Map([["a", 1]]);
  const schema = z.object({
    m: z.map(z.string(), z.number()).default(m1, { skipEncoding: { mode: "strict" } }),
  });
  expect(schema.encode({ m: m1 })).toEqual({});
  expect(schema.encode({ m: new Map([["a", 1]]) })).toEqual({ m: new Map([["a", 1]]) });
});`
  },
  {
    name: 'T_Strict_Array_Reference',
    code: `
test("T_Strict_Array_Reference", () => {
  const arr = [1, 2];
  const schema = z.object({
    a: z.array(z.number()).default(arr, { skipEncoding: { mode: "strict" } }),
  });
  expect(schema.encode({ a: arr })).toEqual({});
  expect(schema.encode({ a: [1, 2] })).toEqual({ a: [1, 2] });
});`
  },
  {
    name: 'T_Shallow_Nested_Object_Difference',
    code: `
test("T_Shallow_Nested_Object_Difference", () => {
  const defaultObj = { a: { b: 1 } };
  const schema = z.object({
    o: z.object({ a: z.object({ b: z.number() }) }).default(defaultObj, {
      skipEncoding: { mode: "shallow" }
    }),
  });
  // Same top-level reference inside default
  expect(schema.encode({ o: defaultObj })).toEqual({});
  // Different inner reference should NOT be omitted in shallow mode
  expect(schema.encode({ o: { a: { b: 1 } } })).toEqual({ o: { a: { b: 1 } } });
});`
  },
  {
    name: 'T_Shallow_Array_Nested_Difference',
    code: `
test("T_Shallow_Array_Nested_Difference", () => {
  const item = { x: 1 };
  const schema = z.object({
    arr: z.array(z.object({ x: z.number() })).default([item], {
      skipEncoding: { mode: "shallow" }
    }),
  });
  expect(schema.encode({ arr: [item] })).toEqual({});
  expect(schema.encode({ arr: [{ x: 1 }] })).toEqual({ arr: [{ x: 1 }] });
});`
  },
  {
    name: 'T_Shallow_Set_Objects_Difference',
    code: `
test("T_Shallow_Set_Objects_Difference", () => {
  const obj1 = { id: 1 };
  const schema = z.object({
    s: z.set(z.object({ id: z.number() })).default(new Set([obj1]), {
      skipEncoding: { mode: "shallow" }
    }),
  });
  expect(schema.encode({ s: new Set([obj1]) })).toEqual({});
  expect(schema.encode({ s: new Set([{ id: 1 }]) })).toEqual({ s: new Set([{ id: 1 }]) });
});`
  },
  {
    name: 'T_Shallow_Map_Entries_Difference',
    code: `
test("T_Shallow_Map_Entries_Difference", () => {
  const k = { k: 1 };
  const v = { v: 2 };
  const schema = z.object({
    m: z.map(z.object({ k: z.number() }), z.object({ v: z.number() })).default(
      new Map([[k, v]]),
      { skipEncoding: { mode: "shallow" } }
    ),
  });
  expect(schema.encode({ m: new Map([[k, v]]) })).toEqual({});
  expect(schema.encode({ m: new Map([[{ k: 1 }, v]]) })).toEqual({
    m: new Map([[{ k: 1 }, v]])
  });
});`
  },
  {
    name: 'T_Tuple_All_Elements_Skipped',
    code: `
test("T_Tuple_All_Elements_Skipped", () => {
  const schema = z.tuple([
    z.string().default("a", { skipEncoding: true }),
    z.string().default("b", { skipEncoding: true }),
  ]);
  const res = schema.encode(["a", "b"]);
  expect(res).toEqual([]);
  expect(res.length).toBe(0);
});`
  },
  {
    name: 'T_Set_Bipartite_Duplicate_Match',
    code: `
test("T_Set_Bipartite_Duplicate_Match", () => {
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
    name: 'T_Record_Empty_String_Default',
    code: `
test("T_Record_Empty_String_Default", () => {
  const schema = z.record(
    z.string().default("", { skipEncoding: true }),
    z.number()
  );
  expect(schema.encode({ "": 10, a: 20 })).toEqual({ a: 20 });
});`
  },
  {
    name: 'T_Date_Set_Order_Independent',
    code: `
test("T_Date_Set_Order_Independent", () => {
  const d1 = new Date(100);
  const d2 = new Date(200);
  const schema = z.object({
    s: z.set(z.date()).default(new Set([d1, d2]), { skipEncoding: true }),
  });
  expect(schema.encode({ s: new Set([new Date(200), new Date(100)]) })).toEqual({});
});`
  }
];

const results = {};

for (const t of tests) {
  results[t.name] = {};
  for (const a of [...agents, 'solution']) {
    execSync('git reset --hard HEAD', { cwd: ZOD_DIR, stdio: 'pipe' });
    execSync('git clean -fd', { cwd: ZOD_DIR, stdio: 'pipe' });

    if (a === 'solution') {
      execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/MAA/2_UPLOAD_THIS_AS_SOLUTION_PATCH/solution.patch', {
        cwd: ZOD_DIR,
        stdio: 'pipe'
      });
    } else {
      const p = path.join(AGENT_DIR, `Nova_Nova_${a}`, 'solution-patch.patch');
      let txt = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
      const tmp = path.join(ZOD_DIR, '_tmp.patch');
      fs.writeFileSync(tmp, txt, 'utf8');
      execSync('git apply --whitespace=fix _tmp.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
      fs.unlinkSync(tmp);
    }

    const testFile = `import { expect, test } from "vitest";\nimport { z } from "../../../index.js";\n${t.code}\n`;
    const specPath = path.join(ZOD_DIR, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts');
    fs.writeFileSync(specPath, testFile, 'utf8');

    try {
      execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', {
        cwd: ZOD_DIR,
        stdio: 'pipe',
        timeout: 10000
      });
      results[t.name][a] = 'PASS';
    } catch (e) {
      results[t.name][a] = 'FAIL';
    }
  }
}

console.log('\n=================== 6-AGENT DISCRIMINATOR RESULTS ===================');
console.log('Test Name'.padEnd(40) + ' | ' + [...agents, 'solution'].map(x => String(x).padStart(6)).join(' | '));
console.log('-'.repeat(95));
for (const t of tests) {
  const row = [t.name.padEnd(40)];
  for (const a of [...agents, 'solution']) {
    row.push((results[t.name][a] || 'FAIL').padStart(6));
  }
  console.log(row.join(' | '));
}
