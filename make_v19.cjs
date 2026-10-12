const fs = require('fs');

const content = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH_V18.patch', 'utf-8');

const lines = content.split('\n');

// 1. Remove the first 9 lines (the broken nova weakmap test)
const newLines = lines.slice(9);

// 2. Find the position to insert the new test
const insertPos = newLines.findIndex(line => line.startsWith('diff --git a/test.sh'));

const newTest = `+test("encoding default that produces issues should keep current value without throwing", () => {
+  const inner = z.string().length(2);
+  const schema = inner.default("hello", { skipEncoding: true });
+  expect(schema.encode("ab")).toBe("ab");
+});
+`;

newLines.splice(insertPos, 0, newTest);

fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH_V19.patch', newLines.join('\n'));
console.log('Created V19 patch');
