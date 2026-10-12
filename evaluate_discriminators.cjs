const fs = require("fs");
const { execSync } = require("child_process");

const tests = `
test("discriminator: crash on cycles", () => {
  const a = {}; a.next = a;
  const b = { next: {} }; b.next.next = b;
  const schema = z.object({ s: z.any().default(a, { skipEncoding: true }) });
  expect(schema.encode({ s: b })).toEqual({}); 
});

test("discriminator: garbage bug", () => {
  const O1 = { val: 1 }, O2 = { val: 2 };
  const a = [ [O1, {val: 2}], O1 ];
  const b = [ [O2, {val: 1}], O2 ];
  const schema = z.object({ s: z.any().default(a, { skipEncoding: true }) });
  expect(schema.encode({ s: b })).toEqual({}); 
});

test("discriminator: many-to-one", () => {
  const a = new Set([ {val: 3}, {val: 3} ]);
  const b = new Set([ {val: 3}, {val: 4} ]);
  const schema = z.object({ s: z.any().default(a, { skipEncoding: true }) });
  expect(schema.encode({ s: b })).toEqual({ s: b }); 
});

test("discriminator: sparse vs dense array", () => {
  const arr1 = []; arr1[1] = 1;
  const arr2 = [undefined, 1];
  const schema = z.object({ s: z.any().default(arr1, { skipEncoding: true }) });
  expect(schema.encode({ s: arr2 })).toEqual({ s: arr2 });
});

test("discriminator: Set element deep equality", () => {
  const schema = z.any().default(new Set([{a: 1}]), { skipEncoding: true });
  expect(z.object({ s: schema }).encode({ s: new Set([{a: 1}]) })).toEqual({});
});
`;

const results = {};

for (let i = 1; i <= 12; i++) {
  console.log("Testing Agent " + i);
  execSync("git reset --hard HEAD && git clean -fd", {stdio: "ignore"});
  try {
    execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore"});
  } catch (e) {
    console.log("Apply failed for Agent " + i);
    continue;
  }
  
  let content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8");
  fs.writeFileSync("packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", content + "\n" + tests);
  
  const testNames = ["crash on cycles", "garbage bug", "many-to-one", "sparse vs dense array", "Set element deep equality"];
  results[i] = {};
  for (const name of testNames) {
    try {
      execSync(`pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t "${name}"`, {stdio: "ignore"});
      results[i][name] = "PASS";
    } catch (e) {
      results[i][name] = "FAIL";
    }
  }
}
console.log(JSON.stringify(results, null, 2));
