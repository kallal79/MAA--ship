const { execSync } = require("child_process");
const fs = require("fs");

const TEST_STR = `
test("discriminator: passes Agent 3 with garbage bug", () => {
  const O1 = { val: 1 };
  const O2 = { val: 2 };
  const O1_COPY = { val: 1 };
  const O2_COPY = { val: 2 };
  
  const a = [ new Set([ O1, O2_COPY ]), O1 ];
  const b = [ new Set([ O2, O1_COPY ]), O2 ];
  
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
  execSync(`pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t "passes Agent 3"`, {encoding: "utf8"});
  console.log("PASS");
} catch (e) {
  console.log("FAIL");
}
