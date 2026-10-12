const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';
const agents = [4, 5, 6, 7, 9, 12, 'solution'];

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

test("run all candidate discriminators", () => {
  // 1. Map shallow mode compares both keys and values by identity
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

  // 2. Set shallow mode compares elements by identity
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

  // 3. Strict mode on Map compares by reference
  record("strict_mode_map", () => {
    const m1 = new Map([["a", 1]]);
    const schema = z.object({
      m: z.map(z.string(), z.number()).default(m1, { skipEncoding: { mode: "strict" } }),
    });
    expect(schema.encode({ m: m1 })).toEqual({});
    expect(schema.encode({ m: new Map([["a", 1]]) })).toEqual({ m: new Map([["a", 1]]) });
  });

  // 4. Strict mode on Set compares by reference
  record("strict_mode_set", () => {
    const s1 = new Set([1, 2]);
    const schema = z.object({
      s: z.set(z.number()).default(s1, { skipEncoding: { mode: "strict" } }),
    });
    expect(schema.encode({ s: s1 })).toEqual({});
    expect(schema.encode({ s: new Set([1, 2]) })).toEqual({ s: new Set([1, 2]) });
  });

  // 5. Sparse array dense conversion
  record("sparse_array_dense_conversion", () => {
    const schema = z.array(z.number().default(99, { skipEncoding: true }));
    const arr = [];
    arr[0] = 1;
    arr[2] = 99;
    arr[3] = 3;
    expect(schema.encode(arr)).toEqual([1, 3]);
  });

  // 6. Nested record omission
  record("nested_record_omission", () => {
    const schema = z.record(
      z.string(),
      z.record(z.string(), z.number().default(0, { skipEncoding: true }))
    );
    expect(schema.encode({ a: { x: 0, y: 1 }, b: { x: 0 } })).toEqual({
      a: { y: 1 },
      b: {},
    });
  });

  // 7. Tuple trailing defaults drops trailing
  record("tuple_trailing_defaults", () => {
    const schema = z.tuple([
      z.string(),
      z.number().default(0, { skipEncoding: true }),
      z.boolean().default(false, { skipEncoding: true }),
    ]);
    expect(schema.encode(["hello", 0, false])).toEqual(["hello"]);
    expect(schema.encode(["hello", 1, false])).toEqual(["hello", 1]);
  });

  // 8. Tuple middle removal reindexes
  record("tuple_middle_removal_reindexes", () => {
    const schema = z.tuple([
      z.number(),
      z.string().default("omit", { skipEncoding: true }),
      z.number(),
    ]);
    const res = schema.encode([10, "omit", 20]);
    expect(res).toEqual([10, 20]);
    expect(res.length).toBe(2);
  });

  // 9. Map with date keys and defaults
  record("map_with_date_keys", () => {
    const d1 = new Date(100);
    const schema = z.map(z.date(), z.number().default(0, { skipEncoding: true }));
    const m = new Map([[d1, 0], [new Date(200), 1]]);
    expect(schema.encode(m)).toEqual(new Map([[new Date(200), 1]]));
  });

  // 10. Record with key schema default omission
  record("record_key_schema_default", () => {
    const schema = z.record(
      z.string().default("skipMe", { skipEncoding: true }),
      z.number()
    );
    expect(schema.encode({ skipMe: 10, keepMe: 20 })).toEqual({ keepMe: 20 });
  });

  // 11. Array order sensitivity in deep equality
  record("array_order_sensitivity", () => {
    const schema = z.object({
      arr: z.array(z.number()).default([1, 2], { skipEncoding: true }),
    });
    expect(schema.encode({ arr: [2, 1] })).toEqual({ arr: [2, 1] });
  });

  // 12. Shallow mode on array with objects
  record("shallow_array_objects", () => {
    const o1 = { x: 1 };
    const schema = z.object({
      arr: z.array(z.any()).default([o1], { skipEncoding: { mode: "shallow" } }),
    });
    expect(schema.encode({ arr: [o1] })).toEqual({});
    expect(schema.encode({ arr: [{ x: 1 }] })).toEqual({ arr: [{ x: 1 }] });
  });

  // 13. Shallow mode on object with nested object
  record("shallow_object_nested", () => {
    const nested = { y: 2 };
    const schema = z.object({
      obj: z.object({ nested: z.any() }).default({ nested }, { skipEncoding: { mode: "shallow" } }),
    });
    expect(schema.encode({ obj: { nested } })).toEqual({});
    expect(schema.encode({ obj: { nested: { y: 2 } } })).toEqual({ obj: { nested: { y: 2 } } });
  });

  // 14. Negative Zero in strict mode
  record("negative_zero_strict", () => {
    const schema = z.object({
      n: z.number().default(0, { skipEncoding: { mode: "strict" } }),
    });
    expect(schema.encode({ n: 0 })).toEqual({});
    expect(schema.encode({ n: -0 })).toEqual({ n: -0 });
  });

  // 15. Record empty string key default
  record("record_empty_string_key_default", () => {
    const schema = z.record(
      z.string().default("", { skipEncoding: true }),
      z.number()
    );
    expect(schema.encode({ "": 10, a: 20 })).toEqual({ a: 20 });
  });

  console.log("===REPORT_JSON_START===" + JSON.stringify(report) + "===REPORT_JSON_END===");
});
`;

const specPath = path.join(ZOD_DIR, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts');
const agentReports = {};

for (const agentId of agents) {
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

// Write the full matrix
const testNames = Object.keys(agentReports['solution'] || {});
console.log('\\n================ 6-AGENT CANDIDATE TEST MATRIX ================');
const header = 'Test Name'.padEnd(38) + ' | ' + agents.map(a => String(a).padStart(8)).join(' | ');
console.log(header);
console.log('-'.repeat(header.length));

for (const tn of testNames) {
  const row = [tn.padEnd(38)];
  for (const a of agents) {
    const st = agentReports[a] ? agentReports[a][tn] : 'ERR';
    const isPass = st === 'PASS';
    row.push((isPass ? '  PASS  ' : '  FAIL  ').padStart(8));
  }
  console.log(row.join(' | '));
}

fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/6_agents_reports.json', JSON.stringify(agentReports, null, 2));
