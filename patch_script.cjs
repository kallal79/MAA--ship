const fs = require('fs');
let content = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH_V18.patch', 'utf8');
const search = 'diff --git a/packages/zod/src/v4/classic/tests/encode-defaults-skipEncoding-types.spec.ts';
const replace = "+test('nova weakmap persistent state trap', () => {\n+  const a = { x: 1 };\n+  const b = { x: 2 };\n+  const setLeft = new Set([{ wrapper: a, id: 1 }, { wrapper: a, id: 2 }]);\n+  const setRight = new Set([{ wrapper: b, id: 2 }, { wrapper: a, id: 1 }]);\n+  const schema = z.object({ val: z.any().default(setRight, { skipEncoding: true }) });\n+  expect(z.encode(schema, { val: setLeft })).toEqual({ val: setLeft });\n+});\n+\n" + search;
if (content.includes(search)) {
  content = content.replace(search, replace);
  fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH_V18.patch', content);
  console.log('Successfully appended test.');
} else {
  console.log('Could not find search string.');
}
