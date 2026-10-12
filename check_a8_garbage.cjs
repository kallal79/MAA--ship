const { execSync } = require("child_process");
const fs = require("fs");

const TEST_STR = `
test("discriminator: fails Agent 8 with garbage bug", () => {
  const O1 = { val: 1 };
  const O2 = { val: 2 };
  const a = { x: O1, y: O1 };
  const b = { x: O2, y: O2 };
  
  const schema = z.object({
     s: z.any().default(a, { skipEncoding: true })
  });
  // Should NOT be equal, so it should NOT omit. Expected: { s: b }
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
