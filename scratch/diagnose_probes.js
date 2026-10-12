const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const SOL_PATCH = 'C:/Users/USER/OneDrive/Desktop/MAA/2_UPLOAD_THIS_AS_SOLUTION_PATCH/solution.patch';

function cleanRepo() {
  try { execSync('git reset --hard HEAD', { cwd: ZOD_DIR, stdio: 'pipe' }); } catch(e) {}
  try { execSync('git clean -fd', { cwd: ZOD_DIR, stdio: 'pipe' }); } catch(e) {}
}

cleanRepo();
execSync('git apply --whitespace=fix "' + SOL_PATCH + '"', { cwd: ZOD_DIR });

const probeTestCode = `import { expect, test } from "vitest";
import { z } from "../../../index.js";

// Probe 1: Plain-object-default predicate identity
test("probe 1: plain object default predicate identity", () => {
  const defaultObj = { x: 1 };
  let receivedRaw: any = null;
  const s = z.object({
    o: z.object({ x: z.number() }).default(defaultObj, {
      skipEncoding: (val: any, raw: any) => {
        receivedRaw = raw;
        return val.x === 1;
      },
    }),
  });
  expect(s.encode({ o: { x: 1 } })).toEqual({});
  expect(receivedRaw).toBe(defaultObj);
});

// Probe 2: Nested literal default where actual != default with predicate
test("probe 2: nested literal default where actual != default with predicate", () => {
  const inner = z.object({
    value: z.number().default(0, { skipEncoding: (e: any) => e === 1 }),
  });
  const schema = z.object({
    outer: inner.default({ value: 0 }, { skipEncoding: true }),
  });
  expect(schema.encode({ outer: { value: 1 } })).toEqual({ outer: {} });
});

// Probe 3: Strict mode same reference omission
test("probe 3: strict mode same reference omission", () => {
  const refObj = { a: 1 };
  const schema = z.object({
    v: z.object({ a: z.number() }).default(refObj, { skipEncoding: { mode: "strict" } }),
  });
  expect(schema.encode({ v: refObj })).toEqual({});
  expect(schema.encode({ v: { a: 1 } })).toEqual({ v: { a: 1 } });
});

// Probe 4: Pipe wrapper passes through omission
test("probe 4: pipe wrapper passes through omission", () => {
  const schema = z.object({
    value: z.string().optional().pipe(z.string().default("x", { skipEncoding: true })),
  });
  expect(schema.encode({ value: "x" })).toEqual({});
});

// Probe 5: Shallow Set equality Object.is identity
test("probe 5: shallow Set equality Object.is identity", () => {
  const item = { id: 1 };
  const schema = z.object({
    s: z.set(z.any()).default(new Set([item]), { skipEncoding: { mode: "shallow" } }),
  });
  expect(schema.encode({ s: new Set([item]) })).toEqual({});
  expect(schema.encode({ s: new Set([{ id: 1 }]) })).toEqual({ s: new Set([{ id: 1 }]) });
});
`;

fs.writeFileSync(path.join(ZOD_DIR, 'packages/zod/src/v4/classic/tests/probes.spec.ts'), probeTestCode);

const TMP = path.join(ZOD_DIR, '_vtest_out.txt');
try {
  execSync('cmd /c "npx vitest run packages/zod/src/v4/classic/tests/probes.spec.ts --no-typecheck --typecheck.enabled=false > _vtest_out.txt 2>&1"', { cwd: ZOD_DIR });
} catch(e) {}

const out = fs.readFileSync(TMP, 'utf8').replace(/\u001b\[[0-9;]*m/g, '');
console.log('OUTPUT:\n', out);
