const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';

const discriminatorCandidates = [
  {
    name: 'Set_Deep_Equal_With_Dates',
    code: `
test("Set deep equality with Date objects order-independent", () => {
  const d1 = new Date(1000);
  const d2 = new Date(2000);
  const schema = z.object({
    s: z.set(z.date()).default(new Set([d1, d2]), { skipEncoding: true }),
  });
  expect(schema.encode({ s: new Set([new Date(2000), new Date(1000)]) })).toEqual({});
  expect(schema.encode({ s: new Set([new Date(2000), new Date(3000)]) })).not.toEqual({});
});`
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
});`
  },
  {
    name: 'Record_Default_Key_Omission',
    code: `
test("Record with key schema default omission", () => {
  const schema = z.record(
    z.string().default("defKey", { skipEncoding: true }),
    z.number()
  );
  expect(schema.encode({ defKey: 100, otherKey: 200 })).toEqual({ otherKey: 200 });
});`
  },
  {
    name: 'Container_Set_Order_Independent',
    code: `
test("Container Set order independent default", () => {
  const defaultSet = new Set([1, 2]);
  const schema = z.object({
    s: z.set(z.number()).default(defaultSet, { skipEncoding: true }),
  });
  expect(schema.encode({ s: new Set([2, 1]) })).toEqual({});
  expect(schema.encode({ s: new Set([1, 3]) })).toEqual({ s: new Set([1, 3]) });
});`
  },
  {
    name: 'Container_Map_Order_Independent',
    code: `
test("Container Map order independent default", () => {
  const defaultMap = new Map([["a", 1], ["b", 2]]);
  const schema = z.object({
    m: z.map(z.string(), z.number()).default(defaultMap, { skipEncoding: true }),
  });
  expect(schema.encode({ m: new Map([["b", 2], ["a", 1]]) })).toEqual({});
  expect(schema.encode({ m: new Map([["a", 1], ["b", 3]]) })).toEqual({ m: new Map([["a", 1], ["b", 3]]) });
});`
  },
  {
    name: 'Predicate_2_Args',
    code: `
test("predicate receives rawDefaultValue parameter", () => {
  const received = [];
  const schema = z.object({
    a: z.string().default("fallback", {
      skipEncoding: (val, raw) => {
        received.push({ val, raw });
        return val === raw;
      },
    }),
  });
  expect(schema.encode({ a: "fallback" })).toEqual({});
  expect(received).toEqual([{ val: "fallback", raw: "fallback" }]);
});`
  },
  {
    name: 'Non_Enumerable_Ignore',
    code: `
test("deep equality ignores non-enumerable properties", () => {
  const defaultObj = { a: 1 };
  Object.defineProperty(defaultObj, "secret", {
    value: "hidden",
    enumerable: false,
    configurable: true,
  });
  const schema = z.object({
    obj: z.object({ a: z.number() }).default(defaultObj, { skipEncoding: true }),
  });
  expect(schema.encode({ obj: { a: 1 } })).toEqual({});
});`
  }
];

const results = {};
for (let i = 1; i <= 13; i++) {
  results['Nova #' + i] = [];
}
results['solution'] = [];

for (const cand of discriminatorCandidates) {
  console.log('Testing discriminator:', cand.name);
  
  for (const id of [1,2,3,4,5,6,7,8,9,10,11,12,13, 'solution']) {
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
    
    // Write standalone test
    const testFileContent = `import { expect, test } from "vitest";\nimport { z } from "../../../index.js";\n${cand.code}\n`;
    const specPath = path.join(ZOD_DIR, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts');
    fs.writeFileSync(specPath, testFileContent, 'utf8');
    
    try {
      execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', {
        cwd: ZOD_DIR,
        stdio: 'pipe',
        timeout: 30000
      });
      const key = (typeof id === 'number') ? 'Nova #' + id : 'solution';
      results[key].push(cand.name);
    } catch (err) {}
  }
}

console.log('\n--- PASSING DISCRIMINATORS PER AGENT ---');
for (const [k, v] of Object.entries(results)) {
  console.log(`${k}: [${v.join(', ')}] (${v.length}/${discriminatorCandidates.length})`);
}
