const fs = require('fs');
let patch = fs.readFileSync('c:/Users/USER/OneDrive/Desktop/MAA/FINAL_UPLOAD/DEFINITIVE_TEST_PATCH.patch', 'utf8');

patch = patch.replace(
  '  z.number().default(0, { skipEncoding: { mode: "shallow" } });\n+  z.number().default(0, { skipEncoding: (v: number) => true });\n+});',
  '  z.number().default(0, { skipEncoding: { mode: "shallow" } });\n+  z.number().default(0, { skipEncoding: (v: number) => true });\n+\n+  // Force runtime failure on base branch\n+  const s = z.object({ a: z.number().default(0, { skipEncoding: true }) });\n+  expect(s.encode({ a: 0 })).toEqual({});\n+});'
);

fs.writeFileSync('c:/Users/USER/OneDrive/Desktop/MAA/FINAL_UPLOAD/DEFINITIVE_TEST_PATCH.patch', patch);
console.log("Done");
