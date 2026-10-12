const { execSync } = require("child_process");
const fs = require("fs");

const TEST_STR = `
test("discriminator: fails Agent 8 with garbage bug", () => {
  const O1 = { val: 1 };
  const O2 = { val: 2 };
  
  // We need O1 to compare to O2 and fail, but the overall Set comparison to pass.
  // So a[0] has O1 and O2_COPY. b[0] has O2 and O1_COPY.
  const O1_COPY = { val: 1 };
  const O2_COPY = { val: 2 };
  
  const a = [ new Set([ O1, O2_COPY ]), O1 ];
  const b = [ new Set([ O2, O1_COPY ]), O2 ];
  
  const schema = z.object({
     s: z.any().default(a, { skipEncoding: true })
  });
  // Should NOT be equal. a[1] is O1, b[1] is O2.
  // We expect them to NOT be equal, so { s: b }.
  // BUT Agent 8 will wrongly return {} because it thinks O1 === O2 due to garbage bug!
  expect(schema.encode({ s: b })).toEqual({ s: b }); 
});
`;

let testContent = fs.readFileSync(`C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts`, "utf8");
testContent = testContent + "\n" + TEST_STR;
fs.writeFileSync(`packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts`, testContent);

try {
  execSync(`pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t "garbage bug"`, {encoding: "utf8"});
  console.log("PASS");
} catch (e) {
  console.log("FAIL");
  console.log(e.stdout || e.stderr);
}
