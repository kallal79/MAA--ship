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

const testCode = `import { expect, test } from "vitest";
import { z } from "../../../index.js";

// Finding 1: Factory default does NOT execute factory function during encode when predicate is used
test("factory default does not evaluate factory when predicate is used", () => {
  let factoryCalled = false;
  const schema = z.number().default(
    () => {
      factoryCalled = true;
      throw new Error("factory should not be executed!");
    },
    { skipEncoding: (val, raw) => {
      expect(raw).toBeUndefined();
      return false;
    } }
  );
  expect(schema.encode(1)).toBe(1);
  expect(factoryCalled).toBe(false);
});

// Finding 2: Shallow Set Object.is identity semantics
test("shallow Set element Object.is identity", () => {
  const item = { id: 1 };
  const schema = z.object({
    s: z.set(z.any()).default(new Set([item]), { skipEncoding: { mode: "shallow" } }),
  });
  expect(schema.encode({ s: new Set([item]) })).toEqual({});
  expect(schema.encode({ s: new Set([{ id: 1 }]) })).toEqual({ s: new Set([{ id: 1 }]) });
});

// Finding 3: TypeScript Public API declarations & types
test("TypeScript Public API declarations", () => {
  const s1 = z.string().default("a", { skipEncoding: true });
  const s2 = z.string().default("a", { skipEncoding: false });
  const s3 = z.string().default("a", { skipEncoding: { mode: "strict" } });
  const s4 = z.string().default("a", { skipEncoding: { mode: "shallow" } });
  const s5 = z.string().default("a", { skipEncoding: { mode: "deep" } });
  const s6 = z.string().default("a", { skipEncoding: (val: string, raw?: unknown) => val === "a" });
  const s7 = z.string().default("a", { skipEncoding: async (val: string, raw?: unknown) => val === "a" });
  const s8 = z.string().default(() => "a", { skipEncoding: (val: string, raw?: unknown) => val === "a" });

  expect(s1.encode("a")).toBe("a");
});
`;

fs.writeFileSync(path.join(ZOD_DIR, 'packages/zod/src/v4/classic/tests/findings_test.spec.ts'), testCode);

const TMP = path.join(ZOD_DIR, '_vtest_findings.txt');
try {
  execSync('cmd /c npx vitest run packages/zod/src/v4/classic/tests/findings_test.spec.ts --no-typecheck --typecheck.enabled=false > _vtest_findings.txt 2>&1', { cwd: ZOD_DIR });
} catch(e) {}

let out = '';
if (fs.existsSync(TMP)) {
  out = fs.readFileSync(TMP, 'utf8').replace(/\u001b\[[0-9;]*m/g, '');
  try { fs.unlinkSync(TMP); } catch(e) {}
}

console.log('FINDINGS TEST RESULT:\n', out);
cleanRepo();
