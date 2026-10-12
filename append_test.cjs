const fs = require('fs');
const file = 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts';
let code = fs.readFileSync(file, 'utf8');
const test = `
test("encoding default that produces issues should keep current value without throwing", () => {
  const inner = z.string().length(2);
  const schema = inner.default("hello", { skipEncoding: true });
  expect(schema.encode("ab")).toBe("ab");
});
`;
code += test;
fs.writeFileSync(file, code);
