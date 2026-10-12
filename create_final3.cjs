const fs = require("fs");
const { execSync } = require("child_process");

execSync("git reset --hard HEAD");
execSync("git clean -fd");

const tests = `
test("discriminator: crash on cycles", () => {
  const a: any = {}; a.next = a;
  const b: any = { next: {} }; b.next.next = b;
  const schema = z.object({ s: z.any().default(a, { skipEncoding: true }) });
  expect(schema.encode({ s: b })).toEqual({}); 
});

test("discriminator: Set element deep equality", () => {
  const schema = z.any().default(new Set([{a: 1}]), { skipEncoding: true });
  expect(z.object({ s: schema }).encode({ s: new Set([{a: 1}]) })).toEqual({});
});
`;

let content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8");
fs.writeFileSync("packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", content + "\n" + tests);

execSync("git add packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts");
const testPatch = execSync("git diff --staged").toString();
console.log("Patch length:", testPatch.length);
fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/FINAL_TEST_PATCH_TO_UPLOAD.patch", testPatch);

const solutionPatch = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_1/solution-patch.patch", "utf8");
fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/FINAL_SOLUTION_TO_UPLOAD.patch", solutionPatch);

console.log("Success");
