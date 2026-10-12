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

test("run fine-grained differentiators", () => {
  // 1. Invalid date comparison by timestamp (NaN !== NaN in getTime())
  record("T_Invalid_Date_Timestamp", () => {
    const schema = z.object({
      d: z.date().default(new Date(NaN), { skipEncoding: true }),
    });
    // In deep equality Object.is(NaN, NaN) is true, so getTime() NaNs match
    expect(schema.encode({ d: new Date(NaN) })).toEqual({});
  });

  // 2. NaN in Set
  record("T_NaN_In_Set", () => {
    const schema = z.object({
      s: z.set(z.any()).default(new Set([NaN]), { skipEncoding: true }),
    });
    expect(schema.encode({ s: new Set([NaN]) })).toEqual({});
  });

  // 3. Object with explicit undefined vs missing property
  record("T_Explicit_Undefined_Property", () => {
    const schema = z.object({
      obj: z.object({ a: z.any() }).default({ a: undefined }, { skipEncoding: true }),
    });
    expect(schema.encode({ obj: { a: undefined } })).toEqual({});
    // missing property 'a' is not deep-equal to { a: undefined }
    expect(schema.encode({ obj: {} })).toEqual({ obj: {} });
  });

  // 4. Array order sensitivity in deep equality
  record("T_Array_Order_Sensitivity", () => {
    const schema = z.object({
      arr: z.array(z.number()).default([1, 2], { skipEncoding: true }),
    });
    expect(schema.encode({ arr: [2, 1] })).toEqual({ arr: [2, 1] });
  });

  // 5. Shallow mode with array containing same objects vs different objects
  record("T_Shallow_Array_Objects", () => {
    const o1 = { x: 1 };
    const schema = z.object({
      arr: z.array(z.any()).default([o1], { skipEncoding: { mode: "shallow" } }),
    });
    expect(schema.encode({ arr: [o1] })).toEqual({});
    expect(schema.encode({ arr: [{ x: 1 }] })).toEqual({ arr: [{ x: 1 }] });
  });

  // 6. Shallow mode with plain object containing nested object
  record("T_Shallow_Object_Nested", () => {
    const nested = { y: 2 };
    const schema = z.object({
      obj: z.object({ nested: z.any() }).default({ nested }, { skipEncoding: { mode: "shallow" } }),
    });
    expect(schema.encode({ obj: { nested } })).toEqual({});
    expect(schema.encode({ obj: { nested: { y: 2 } } })).toEqual({ obj: { nested: { y: 2 } } });
  });

  // 7. Factory default function called for each decode/encode
  record("T_Factory_Returns_New_Object", () => {
    const schema = z.object({
      arr: z.array(z.number()).default(() => [1, 2], {
        skipEncoding: (val) => Array.isArray(val) && val.length === 2 && val[0] === 1 && val[1] === 2
      }),
    });
    expect(schema.encode({ arr: [1, 2] })).toEqual({});
    expect(schema.encode({ arr: [1, 3] })).toEqual({ arr: [1, 3] });
  });

  // 8. Symbol property key in plain object
  record("T_Symbol_Key_In_Object", () => {
    const sym = Symbol("myKey");
    const schema = z.object({
      [sym]: z.number().default(42, { skipEncoding: true }),
    });
    expect(schema.encode({ [sym]: 42 })).toEqual({});
    expect(schema.encode({ [sym]: 99 })).toEqual({ [sym]: 99 });
  });

  // 9. Negative Zero in deep vs strict
  record("T_Negative_Zero_Strict", () => {
    const schema = z.object({
      n: z.number().default(0, { skipEncoding: { mode: "strict" } }),
    });
    expect(schema.encode({ n: 0 })).toEqual({});
    expect(schema.encode({ n: -0 })).toEqual({ n: -0 });
  });

  // 10. Record key omitted when key is empty string default
  record("T_Record_Empty_String_Key_Default", () => {
    const schema = z.record(
      z.string().default("", { skipEncoding: true }),
      z.number()
    );
    expect(schema.encode({ "": 10, a: 20 })).toEqual({ a: 20 });
  });

  // 11. Array element default with negative number
  record("T_Array_Negative_Number_Default", () => {
    const schema = z.array(z.number().default(-1, { skipEncoding: true }));
    expect(schema.encode([-1, 2, -1, 4])).toEqual([2, 4]);
  });

  // 12. Multiple nested objects in tuple
  record("T_Tuple_Nested_Objects_Omission", () => {
    const schema = z.tuple([
      z.object({ a: z.number() }).default({ a: 1 }, { skipEncoding: true }),
      z.string(),
    ]);
    expect(schema.encode([{ a: 1 }, "hi"])).toEqual(["hi"]);
    expect(schema.encode([{ a: 2 }, "hi"])).toEqual([{ a: 2 }, "hi"]);
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
    execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/solution.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
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
console.log('\\n================ FINE-GRAINED TEST MATRIX ================');
const header = 'Test Name'.padEnd(38) + ' | ' + allAgents.map(a => String(a).padStart(3)).join(' | ');
console.log(header);
console.log('-'.repeat(header.length));

for (const tn of testNames) {
  const row = [tn.padEnd(38)];
  for (const a of allAgents) {
    const st = agentReports[a] ? agentReports[a][tn] : 'ERR';
    const isPass = st === 'PASS';
    row.push((isPass ? ' P ' : ' . ').padStart(3));
  }
  console.log(row.join(' | '));
}

fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/fine_reports.json', JSON.stringify(agentReports, null, 2));
