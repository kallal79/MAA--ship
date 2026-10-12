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

test("run inner encoding and key omission tests", () => {
  // Test 1: Literal default compares after inner encoding (transform/codec)
  record("inner_transform_trimmed_matches_default", () => {
    const inner = z.string().transform((s) => s.trim());
    const schema = z.object({
      s: inner.default("hello", { skipEncoding: true }),
    });
    expect(schema.encode({ s: "  hello  " })).toEqual({});
  });

  // Test 2: Strict mode on Map & Set
  record("strict_mode_map_and_set", () => {
    const m1 = new Map([["a", 1]]);
    const s1 = new Set([1, 2]);
    const schema = z.object({
      m: z.map(z.string(), z.number()).default(m1, { skipEncoding: { mode: "strict" } }),
      s: z.set(z.number()).default(s1, { skipEncoding: { mode: "strict" } }),
    });
    expect(schema.encode({ m: m1, s: s1 })).toEqual({});
    expect(schema.encode({ m: new Map([["a", 1]]), s: new Set([1, 2]) })).toEqual({
      m: new Map([["a", 1]]),
      s: new Set([1, 2]),
    });
  });

  // Test 3: Record with key schema default omission when key matches default
  record("record_key_schema_omission_custom", () => {
    const schema = z.record(
      z.string().default("skipKey", { skipEncoding: true }),
      z.number()
    );
    expect(schema.encode({ skipKey: 1, keepKey: 2 })).toEqual({ keepKey: 2 });
  });

  // Test 4: Map key default omission
  record("map_key_default_omission", () => {
    const schema = z.map(
      z.string().default("skipKey", { skipEncoding: true }),
      z.number()
    );
    expect(schema.encode(new Map([["skipKey", 10], ["keepKey", 20]]))).toEqual(
      new Map([["keepKey", 20]])
    );
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

// Write the full matrix
const testNames = Object.keys(agentReports['solution'] || {});
console.log('\\n================ 13-AGENT TEST MATRIX ================');
const header = 'Test Name'.padEnd(45) + ' | ' + allAgents.map(a => String(a).padStart(4)).join(' | ');
console.log(header);
console.log('-'.repeat(header.length));

for (const tn of testNames) {
  const row = [tn.padEnd(45)];
  for (const a of allAgents) {
    const st = agentReports[a] ? agentReports[a][tn] : 'ERR';
    const isPass = st === 'PASS';
    row.push((isPass ? 'PASS' : 'FAIL').padStart(4));
  }
  console.log(row.join(' | '));
}

fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/13_agent_compare.json', JSON.stringify(agentReports, null, 2));
