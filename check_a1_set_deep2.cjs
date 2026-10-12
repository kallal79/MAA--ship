const { execSync } = require("child_process");
const fs = require("fs");

const TEST_STR = `
test("discriminator: fails Agent 1 on Set element deep equality", () => {
  const schema = z.any().default(new Set([{a: 1}]), { skipEncoding: true });
  const result = z.object({ s: schema }).encode({ s: new Set([{a: 1}]) });
  throw new Error("RESULT: " + (result.s === undefined ? "undefined" : result.s instanceof Set ? "Set" : JSON.stringify(result)));
});
`;

let testContent = fs.readFileSync(`C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts`, "utf8");
testContent = testContent + "\n" + TEST_STR;
fs.writeFileSync(`packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts`, testContent);

try {
  const out = execSync(`pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t "Agent 1 on Set element"`, {encoding: "utf8"});
  console.log("PASS\n" + out);
} catch (e) {
  console.log("FAIL\n" + e.stdout + "\n" + e.stderr);
}
