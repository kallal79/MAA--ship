const { execSync } = require("child_process");
const fs = require("fs");

const TEST_STR = `
test("discriminator: simple array", () => {
  const a = [ 1, 2 ];
  const b = [ 1, 2 ];
  const schema = z.object({
     s: z.any().default(a, { skipEncoding: true })
  });
  expect(schema.encode({ s: b })).toEqual({}); 
});
`;

let testContent = fs.readFileSync(`C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts`, "utf8");
testContent = testContent + "\n" + TEST_STR;
fs.writeFileSync(`packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts`, testContent);

try {
  execSync(`pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t "simple array"`, {encoding: "utf8"});
  console.log("PASS");
} catch (e) {
  console.log("FAIL");
}
