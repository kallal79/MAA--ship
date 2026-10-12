const fs = require('fs');
let p = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts', 'utf8');
p += `

test("deep equality does not treat different class instances as equal", () => {
  class Foo { x = 1; }
  const schema = z.any().default(new Foo(), { skipEncoding: true });
  expect(z.object({ f: schema }).encode({ f: new Foo() })).toEqual({ f: new Foo() });
});
`;
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts', p);
