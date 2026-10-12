const fs = require('fs');

let p = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_PERFECT_TEST_PATCH.patch', 'utf8');

const oldDeepEq = `\\+test\\("encode skips default values with deep equality", \\(\\) => \\{[\\s\\S]*?\\}\\);`;
const newDeepEq = `+test("encode skips default values with deep equality", () => {
+  const schema = z.object({
+    arr: z.array(z.number()).default([1, 2], { skipEncoding: true }),
+    obj: z.object({ x: z.number() }).default({ x: 1 }, { skipEncoding: true }),
+    prim2: z.number().default(-0, { skipEncoding: true }),
+  });
+  expect(
+    schema.encode({
+      arr: [1, 2],
+      obj: { x: 1 },
+      prim2: -0,
+    })
+  ).toEqual({});
+});`;

const oldChained = `\\+test\\("chained defaulted schemas evaluate skipEncoding independently", \\(\\) => \\{[\\s\\S]*?\\}\\);`;
const newChained = `+test("chained defaulted schemas evaluate skipEncoding independently", () => {
+  const inner = z.number().default(0, { skipEncoding: true });
+  const outer = inner.default(5, { skipEncoding: true });
+  expect(outer.encode(0)).toBe(0);
+  expect(z.object({ a: outer }).encode({ a: 5 })).toEqual({});
+});`;

p = p.replace(new RegExp(oldDeepEq), newDeepEq);
p = p.replace(new RegExp(oldChained), newChained);

// Also remove .skip if any exists just in case
p = p.replace(/\+test\.skip\(/g, '+test(');

fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/OLYMPUS_TEST_PATCH_FINAL.patch', p);
console.log("Done generating OLYMPUS_TEST_PATCH_FINAL.patch");
