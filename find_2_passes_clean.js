const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';
const allAgents = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 'solution'];

const testCode = `
import { expect, test } from "vitest";
import { z } from "../../../index.js";

const report = {};

function record(name, fn) {
  try {
    fn();
    report[name] = "PASS";
  } catch (e) {
    report[name] = "FAIL: " + (e.message || e);
  }
}

test("run all candidate tests cleanly", () => {
  record("strict_mode_map", () => {
    const m1 = new Map([["a", 1]]);
    const schema = z.object({
      m: z.map(z.string(), z.number()).default(m1, { skipEncoding: { mode: "strict" } }),
    });
    expect(schema.encode({ m: m1 })).toEqual({});
    expect(schema.encode({ m: new Map([["a", 1]]) })).toEqual({ m: new Map([["a", 1]]) });
  });

  record("strict_mode_set", () => {
    const s1 = new Set([1, 2]);
    const schema = z.object({
      s: z.set(z.number()).default(s1, { skipEncoding: { mode: "strict" } }),
    });
    expect(schema.encode({ s: s1 })).toEqual({});
    expect(schema.encode({ s: new Set([1, 2]) })).toEqual({ s: new Set([1, 2]) });
  });

  record("map_shallow_mode_key_identity", () => {
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
  });

  record("set_shallow_mode_identity", () => {
    const obj1 = { a: 1 };
    const schema = z.object({
      s: z.set(z.object({ a: z.number() })).default(new Set([obj1]), {
        skipEncoding: { mode: "shallow" },
      }),
    });
    expect(schema.encode({ s: new Set([obj1]) })).toEqual({});
    expect(schema.encode({ s: new Set([{ a: 1 }]) })).toEqual({
      s: new Set([{ a: 1 }]),
    });
  });

  record("predicate_raw_default", () => {
    let passedRaw = null;
    const schema = z.object({
      a: z.string().default("fallback", {
        skipEncoding: (val, raw) => {
          passedRaw = raw;
          return val === "fallback";
        },
      }),
    });
    expect(schema.encode({ a: "fallback" })).toEqual({});
    expect(passedRaw).toBe("fallback");
  });

  record("record_key_schema_default", () => {
    const schema = z.record(
      z.string().default("defKey", { skipEncoding: true }),
      z.number()
    );
    expect(schema.encode({ defKey: 100, otherKey: 200 })).toEqual({ otherKey: 200 });
  });

  record("set_deep_dates_order_independent", () => {
    const d1 = new Date(1000);
    const d2 = new Date(2000);
    const schema = z.object({
      s: z.set(z.date()).default(new Set([d1, d2]), { skipEncoding: true }),
    });
    expect(schema.encode({ s: new Set([new Date(2000), new Date(1000)]) })).toEqual({});
    expect(schema.encode({ s: new Set([new Date(2000), new Date(3000)]) })).toEqual({
      s: new Set([new Date(2000), new Date(3000)]),
    });
  });

  record("non_enumerable_on_default_object", () => {
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
  });

  record("factory_strict_mode_error", () => {
    const schema = z.object({
      a: z.number().default(() => 0, { skipEncoding: { mode: "strict" } }),
    });
    expect(() => schema.encode({ a: 0 })).toThrowError(
      /Cannot use skipEncoding: \{"mode":"strict"\} with a factory default/
    );
  });

  record("async_predicate_sync_throws", () => {
    const schema = z.object({
      a: z.number().default(0, { skipEncoding: async (v) => v === 0 }),
    });
    expect(() => schema.encode({ a: 0 })).toThrowError(
      /Cannot use async skipEncoding in synchronous encode/
    );
  });

  record("tuple_multiple_middle_compacts", () => {
    const schema = z.tuple([
      z.number(),
      z.string().default("a", { skipEncoding: true }),
      z.string().default("b", { skipEncoding: true }),
      z.boolean(),
    ]);
    expect(schema.encode([10, "a", "b", true])).toEqual([10, true]);
  });

  record("root_level_encode_default", () => {
    const schema = z.number().default(0, { skipEncoding: true });
    expect(z.encode(schema, 0)).toBe(0);
    expect(z.encode(schema, 1)).toBe(1);
  });

  console.log("===REPORT_JSON_START===" + JSON.stringify(report) + "===REPORT_JSON_END===");
});
`;

const specPath = path.join(ZOD_DIR, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts');
const agentReports = {};

for (const agentId of allAgents) {
  execSync('git reset --hard HEAD', { cwd: ZOD_DIR, stdio: 'pipe' });
  execSync('git clean -fd', { cwd: ZOD_DIR, stdio: 'pipe' });

  if (agentId === 'solution') {
    execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/MAA/2_UPLOAD_THIS_AS_SOLUTION_PATCH/solution.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
  } else {
    const p = path.join(AGENT_DIR, 'Nova_Nova_' + agentId, 'solution-patch.patch');
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

  fs.writeFileSync(specPath, testCode, 'utf8');

  try {
    const out = execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', {
      cwd: ZOD_DIR,
      stdio: 'pipe',
      timeout: 15000
    }).toString('utf8');
    
    const m = out.match(/===REPORT_JSON_START===(.*?)===REPORT_JSON_END===/);
    if (m) {
      agentReports[agentId] = JSON.parse(m[1]);
    }
  } catch (err) {
    const combined = (err.stdout ? err.stdout.toString('utf8') : '') + (err.stderr ? err.stderr.toString('utf8') : '');
    const m = combined.match(/===REPORT_JSON_START===(.*?)===REPORT_JSON_END===/);
    if (m) {
      agentReports[agentId] = JSON.parse(m[1]);
    }
  }
}

const testIds = Object.keys(agentReports['solution'] || {});
console.log('\\n--- COMPREHENSIVE TEST RESULTS TABLE ---');
const header = 'Test ID'.padEnd(38) + ' | ' + allAgents.map(a => String(a).padStart(4)).join(' | ');
console.log(header);
console.log('-'.repeat(header.length));
for (const tid of testIds) {
  const row = [tid.padEnd(38)];
  for (const a of allAgents) {
    const isPass = agentReports[a] && agentReports[a][tid] === 'PASS';
    row.push((isPass ? 'PASS' : 'FAIL').padStart(4));
  }
  console.log(row.join(' | '));
}

// Find all subsets of tests where solution is 100% PASS and exactly 2 Nova agents pass
const validSolTests = testIds.filter(tid => agentReports['solution'] && agentReports['solution'][tid] === 'PASS');
console.log('\\nTests passing reference solution (' + validSolTests.length + '/' + testIds.length + '):', validSolTests);

console.log('\\n--- SEARCHING FOR 2-PASS COMBINATIONS ---');
function getSubsets(arr, maxLen) {
  const subsets = [[]];
  for (const el of arr) {
    const len = subsets.length;
    for (let i = 0; i < len; i++) {
      if (subsets[i].length < maxLen) {
        subsets.push([...subsets[i], el]);
      }
    }
  }
  return subsets.filter(s => s.length > 0);
}

const subsets = getSubsets(validSolTests, 5);
const validCombinations = [];

for (const sub of subsets) {
  const passingNova = [];
  for (let id = 1; id <= 13; id++) {
    const allPass = sub.every(tid => agentReports[id] && agentReports[id][tid] === 'PASS');
    if (allPass) {
      passingNova.push('Nova #' + id);
    }
  }
  if (passingNova.length === 2) {
    validCombinations.push({
      tests: sub,
      passingNova: passingNova.join(', ')
    });
  }
}

console.log(`Found ${validCombinations.length} combinations yielding EXACTLY 2 Nova passes!`);
for (const vc of validCombinations.slice(0, 20)) {
  console.log(`Passing [${vc.passingNova}] -> Tests: [${vc.tests.join(', ')}]`);
}

fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/2_pass_combinations.json', JSON.stringify(validCombinations, null, 2));
