const fs = require("fs");
const { execSync } = require("child_process");

// The updated test content - base (45 tests) + new tests for T4 shallow Map + S1 chained default + discriminators
const newTests = `
test("shallow equality mode for Maps (positive: same instances match)", () => {
  const keyObj = { k: 1 };
  const valObj = { v: 2 };
  const mapDefault = new Map([[keyObj, valObj]]);
  const schema = z.object({
    m: z.any().default(mapDefault, { skipEncoding: { mode: "shallow" } }),
  });
  // Same key and value instances - should match (OMIT)
  expect(schema.encode({ m: new Map([[keyObj, valObj]]) })).toEqual({});
});

test("shallow equality mode for Maps (negative: structurally same but distinct instances do not match)", () => {
  const keyObj = { k: 1 };
  const valObj = { v: 2 };
  const mapDefault = new Map([[keyObj, valObj]]);
  const schema = z.object({
    m: z.any().default(mapDefault, { skipEncoding: { mode: "shallow" } }),
  });
  // Structurally identical but distinct instances - should NOT match
  const distinctMap = new Map([[{ k: 1 }, { v: 2 }]]);
  expect(schema.encode({ m: distinctMap })).toEqual({ m: distinctMap });
});

test("chained defaults each evaluate skipEncoding independently (S1 regression)", () => {
  // z.number().default(0, {skipEncoding:true}).default(5, {skipEncoding:true})
  const inner = z.number().default(0, { skipEncoding: true });
  const outer = inner.default(5, { skipEncoding: true });
  // encode(0): inner default=0 matches -> inner omits, but outer default=5 != 0 -> outer does NOT omit
  expect(z.object({ v: outer }).encode({ v: 0 })).toEqual({ v: 0 });
  // encode(5): inner default=0 != 5 -> inner does not omit, outer default=5 == 5 -> outer OMITS
  expect(z.object({ v: outer }).encode({ v: 5 })).toEqual({});
  // encode(7): neither inner nor outer default match -> 7 is emitted
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
`;

let content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8");
fs.writeFileSync("packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", content + "\n" + newTests);

execSync("git add packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts");
const testPatch = execSync("git diff --staged").toString();
console.log("Test patch length:", testPatch.length);
fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/FINAL_TEST_PATCH_TO_UPLOAD.patch", testPatch);
fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/FINAL_TEST_PATCH_TO_UPLOAD.patch", testPatch);

execSync("git reset HEAD", {stdio: "ignore"});
console.log("Done");
