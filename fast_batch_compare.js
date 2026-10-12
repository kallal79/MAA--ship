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

test("run all candidate edge cases", () => {
  record("T_Tuple_Middle_Removal", () => {
    const schema = z.tuple([
      z.number(),
      z.string().default("omit", { skipEncoding: true }),
      z.number(),
    ]);
    const res = schema.encode([10, "omit", 20]);
    expect(res).toEqual([10, 20]);
    expect(res.length).toBe(2);
  });

  record("T_Tuple_All_Omitted", () => {
    const schema = z.tuple([
      z.number().default(1, { skipEncoding: true }),
      z.number().default(2, { skipEncoding: true }),
    ]);
    expect(schema.encode([1, 2])).toEqual([]);
  });

  record("T_Set_Bipartite_Duplicate_Target", () => {
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
  });

  record("T_Nested_Record_Omission", () => {
    const schema = z.record(
      z.string(),
      z.record(z.string(), z.number().default(0, { skipEncoding: true }))
    );
    expect(schema.encode({ a: { x: 0, y: 1 }, b: { x: 0 } })).toEqual({
      a: { y: 1 },
      b: {},
    });
  });

  record("T_Map_Shallow_Identity", () => {
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

  record("T_Set_Shallow_Identity", () => {
    const obj1 = { a: 1 };
    const obj2 = { a: 1 };
    const schema = z.object({
      s: z.set(z.object({ a: z.number() })).default(new Set([obj1]), {
        skipEncoding: { mode: "shallow" },
      }),
    });
    expect(schema.encode({ s: new Set([obj1]) })).toEqual({});
    expect(schema.encode({ s: new Set([obj2]) })).toEqual({ s: new Set([obj2]) });
  });

  record("T_Map_Key_Schema_Omission", () => {
    const schema = z.map(
      z.string().default("skipKey", { skipEncoding: true }),
      z.number()
    );
    const m = new Map([["skipKey", 1], ["keepKey", 2]]);
    expect(schema.encode(m)).toEqual(new Map([["keepKey", 2]]));
  });

  record("T_Nullish_Wrapper_Transparency", () => {
    const schema = z.object({
      a: z.string().default("foo", { skipEncoding: true }).nullish(),
    });
    expect(schema.encode({ a: "foo" })).toEqual({});
    expect(schema.encode({ a: null })).toEqual({ a: null });
    expect(schema.encode({ a: undefined })).toEqual({});
  });

  record("T_Factory_Mode_Object_Error_Message", () => {
    expect(() => {
      z.string().default(() => "hi", { skipEncoding: { mode: "deep" } });
    }).toThrow(/Cannot use skipEncoding: {"mode":"deep"} with a factory default/);
  });

  record("T_Date_Object_Negative_Timestamp", () => {
    const schema = z.object({
      d: z.date().default(new Date(-1000), { skipEncoding: true }),
    });
    expect(schema.encode({ d: new Date(-1000) })).toEqual({});
    expect(schema.encode({ d: new Date(1000) })).toEqual({ d: new Date(1000) });
  });

  record("T_Strict_Mode_Map", () => {
    const m1 = new Map([["a", 1]]);
    const schema = z.object({
      m: z.map(z.string(), z.number()).default(m1, { skipEncoding: { mode: "strict" } }),
    });
    expect(schema.encode({ m: m1 })).toEqual({});
    expect(schema.encode({ m: new Map([["a", 1]]) })).toEqual({ m: new Map([["a", 1]]) });
  });

  record("T_Strict_Mode_Set", () => {
    const s1 = new Set([1, 2]);
    const schema = z.object({
      s: z.set(z.number()).default(s1, { skipEncoding: { mode: "strict" } }),
    });
    expect(schema.encode({ s: s1 })).toEqual({});
    expect(schema.encode({ s: new Set([1, 2]) })).toEqual({ s: new Set([1, 2]) });
  });

  record("T_Predicate_Receives_Raw_Default", () => {
    let passedRaw = null;
    const schema = z.string().default("DEFAULT_VAL", {
      skipEncoding: (val, raw) => {
        passedRaw = raw;
        return val === raw;
      }
    });
    schema.encode("DEFAULT_VAL");
    expect(passedRaw).toBe("DEFAULT_VAL");
  });

  record("T_Async_Predicate_Sync_Throws", () => {
    const schema = z.string().default("test", {
      skipEncoding: async () => true,
    });
    expect(() => schema.encode("test")).toThrow(
      "Cannot use async skipEncoding in synchronous encode"
    );
  });

  record("T_Set_Deep_Equal_With_Dates", () => {
    const d1 = new Date(1000);
    const d2 = new Date(2000);
    const schema = z.object({
      s: z.set(z.date()).default(new Set([d1, d2]), { skipEncoding: true }),
    });
    expect(schema.encode({ s: new Set([new Date(2000), new Date(1000)]) })).toEqual({});
    expect(schema.encode({ s: new Set([new Date(2000), new Date(3000)]) })).not.toEqual({});
  });

  record("T_Map_Deep_Equal_With_Nested_Sets", () => {
    const schema = z.object({
      m: z.map(z.string(), z.set(z.number())).default(
        new Map([["k", new Set([1, 2])]]),
        { skipEncoding: true }
      ),
    });
    expect(schema.encode({ m: new Map([["k", new Set([2, 1])]]) })).toEqual({});
    expect(schema.encode({ m: new Map([["k", new Set([1, 3])]]) })).not.toEqual({});
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
    } else {
      console.log('Error running agent ' + agentId);
    }
  }
}

// Write the full matrix
const testNames = Object.keys(agentReports['solution'] || {});
console.log('\\n================ FULL CANDIDATE TEST MATRIX ================');
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

fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/fast_reports.json', JSON.stringify(agentReports, null, 2));
