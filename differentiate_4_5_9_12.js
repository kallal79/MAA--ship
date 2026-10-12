const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';
const agents = [4, 5, 9, 12, 'solution'];

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

test("run 4-5-9-12 differentiators", () => {
  // 1. Record with string key schema default omission
  record("record_default_string_key_omitted", () => {
    const schema = z.record(z.string().default("defKey", { skipEncoding: true }), z.number());
    expect(schema.encode({ defKey: 100, otherKey: 200 })).toEqual({ otherKey: 200 });
  });

  // 2. Tuple multiple middle elements omitted compacts correctly
  record("tuple_multiple_middle_compacts", () => {
    const schema = z.tuple([
      z.number(),
      z.string().default("a", { skipEncoding: true }),
      z.string().default("b", { skipEncoding: true }),
      z.boolean(),
    ]);
    expect(schema.encode([10, "a", "b", true])).toEqual([10, true]);
  });

  // 3. Factory default with strict mode object throws exact error
  record("factory_strict_mode_error", () => {
    const schema = z.object({
      a: z.number().default(() => 0, { skipEncoding: { mode: "strict" } }),
    });
    expect(() => schema.encode({ a: 0 })).toThrowError(
      /Cannot use skipEncoding: \{"mode":"strict"\} with a factory default/
    );
  });

  // 4. Nested optional + nullable wrapper transparency
  record("nested_wrapper_transparency", () => {
    const schema = z.object({
      a: z.number().default(0, { skipEncoding: true }).optional().nullable(),
    });
    expect(schema.encode({ a: 0 })).toEqual({});
    expect(schema.encode({ a: null })).toEqual({ a: null });
    expect(schema.encode({ a: 1 })).toEqual({ a: 1 });
  });

  // 5. Set deep equality bipartite duplicate element rejection
  record("set_bipartite_duplicate_rejection", () => {
    const schema = z.object({
      s: z.set(z.object({ a: z.number() })).default(
        new Set([{ a: 1 }, { a: 2 }]),
        { skipEncoding: true }
      ),
    });
    // Two distinct elements with same value { a: 1 } should NOT match default [{ a: 1 }, { a: 2 }]
    const s1 = new Set([{ a: 1 }, { a: 1 }]);
    expect(schema.encode({ s: s1 })).toEqual({ s: s1 });
  });

  // 6. Map with nested Set deep equality
  record("map_nested_set_deep_equality", () => {
    const schema = z.object({
      m: z.map(z.string(), z.set(z.number())).default(
        new Map([["k", new Set([1, 2])]]),
        { skipEncoding: true }
      ),
    });
    expect(schema.encode({ m: new Map([["k", new Set([2, 1])]]) })).toEqual({});
    expect(schema.encode({ m: new Map([["k", new Set([1, 3])]]) })).toEqual({
      m: new Map([["k", new Set([1, 3])]]),
    });
  });

  // 7. Non-enumerable properties on default object ignored
  record("non_enumerable_ignored_on_default", () => {
    const defaultObj: any = { a: 1 };
    Object.defineProperty(defaultObj, "hidden", {
      value: "secret",
      enumerable: false,
      configurable: true,
    });
    const schema = z.object({
      o: z.object({ a: z.number() }).default(defaultObj, { skipEncoding: true }),
    });
    expect(schema.encode({ o: { a: 1 } })).toEqual({});
  });

  // 8. Non-enumerable properties on input object ignored
  record("non_enumerable_ignored_on_input", () => {
    const inputObj: any = { a: 1 };
    Object.defineProperty(inputObj, "hidden", {
      value: "secret",
      enumerable: false,
      configurable: true,
    });
    const schema = z.object({
      o: z.object({ a: z.number() }).default({ a: 1 }, { skipEncoding: true }),
    });
    expect(schema.encode({ o: inputObj })).toEqual({});
  });

  // 9. Root level encode on defaulted schema
  record("root_level_encode_default", () => {
    const schema = z.number().default(0, { skipEncoding: true });
    expect(z.encode(schema, 0)).toBe(0);
    expect(z.encode(schema, 1)).toBe(1);
  });

  // 10. Strict mode with NaN
  record("strict_mode_nan", () => {
    const schema = z.object({
      x: z.any().default(NaN, { skipEncoding: { mode: "strict" } }),
    });
    expect(schema.encode({ x: NaN })).toEqual({});
    expect(schema.encode({ x: 0 })).toEqual({ x: 0 });
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
console.log('\\n================ 4-5-9-12 TEST MATRIX ================');
const header = 'Test Name'.padEnd(42) + ' | ' + agents.map(a => String(a).padStart(8)).join(' | ');
console.log(header);
console.log('-'.repeat(header.length));

for (const tn of testNames) {
  const row = [tn.padEnd(42)];
  for (const a of agents) {
    const st = agentReports[a] ? agentReports[a][tn] : 'ERR';
    const isPass = st === 'PASS';
    row.push((isPass ? '  PASS  ' : '  FAIL  ').padStart(8));
  }
  console.log(row.join(' | '));
}

fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/4_5_9_12_reports.json', JSON.stringify(agentReports, null, 2));
