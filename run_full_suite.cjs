const fs = require("fs");
const { execSync } = require("child_process");

// Now run the full updated test suite against our patched solution to verify everything passes
fs.writeFileSync("packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts",
  fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8") + `

test("shallow equality mode for Maps (positive: same instances match)", () => {
  const keyObj = { k: 1 };
  const valObj = { v: 2 };
  const mapDefault = new Map([[keyObj, valObj]]);
  const schema = z.object({
    m: z.any().default(mapDefault, { skipEncoding: { mode: "shallow" } }),
  });
  expect(schema.encode({ m: new Map([[keyObj, valObj]]) })).toEqual({});
});

test("shallow equality mode for Maps (negative: structurally same but distinct instances do not match)", () => {
  const keyObj = { k: 1 };
  const valObj = { v: 2 };
  const mapDefault = new Map([[keyObj, valObj]]);
  const schema = z.object({
    m: z.any().default(mapDefault, { skipEncoding: { mode: "shallow" } }),
  });
  const distinctMap = new Map([[{ k: 1 }, { v: 2 }]]);
  expect(schema.encode({ m: distinctMap })).toEqual({ m: distinctMap });
});

test("chained defaults each evaluate skipEncoding independently (S1 regression)", () => {
  const inner = z.number().default(0, { skipEncoding: true });
  const outer = inner.default(5, { skipEncoding: true });
  expect(z.object({ v: outer }).encode({ v: 0 })).toEqual({ v: 0 });
  expect(z.object({ v: outer }).encode({ v: 5 })).toEqual({});
  expect(z.object({ v: outer }).encode({ v: 7 })).toEqual({ v: 7 });
});

test("discriminator: crash on cycles", () => {
  const a: any = {}; a.next = a;
  const b: any = { next: {} }; b.next.next = b;
  const schema = z.object({ s: z.any().default(a, { skipEncoding: true }) });
  expect(schema.encode({ s: b })).toEqual({}); 
});

test("discriminator: Set element deep equality", () => {
  const schema = z.any().default(new Set([{a: 1}]), { skipEncoding: true });
  expect(z.object({ s: schema }).encode({ s: new Set([{a: 1}]) })).toEqual({});
});

test("discriminator: many-to-one Set", () => {
  const O = {val: 1};
  const O_copy = {val: 1};
  const O2 = {val: 2};
  const a = new Set([ O, O_copy ]);
  const b = new Set([ O, O2 ]);
  const schema = z.object({ s: z.any().default(a, { skipEncoding: true }) });
  expect(schema.encode({ s: b })).toEqual({ s: b }); 
});
`);

console.log("Running full test suite...");
try {
  const out = execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false", {stdio: "pipe", timeout: 30000}).toString();
  console.log(out.substring(0, 3000));
} catch(e) {
  console.log("FAILED:", e.stdout?.toString()?.substring(0, 3000) || e.toString().substring(0, 3000));
}
