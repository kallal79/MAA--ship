const fs = require("fs");
const cp = require("child_process");

cp.execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/FINAL_SOLUTION_TO_UPLOAD.patch"`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});

const testContent = `
import { expect, test } from "vitest";
import { z } from "./packages/zod/src/index.ts";

test("check util deepEqual execution", () => {
  const d1 = new Date("2026-01-01");
  const schema = z.any().default(d1, { skipEncoding: true });
  try {
    schema.encode(d1);
  } catch (e) {
    if (e.message.includes("is not a function")) {
      throw new Error("TYPE ERROR DETECTED: " + e.message);
    }
    throw e;
  }
});
`;

let content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8");
fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", content + "\n" + testContent);

try {
  cp.execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t \"check util deepEqual execution\"", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "pipe"});
  console.log("No error!");
} catch (e) {
  const stdout = e.stdout ? e.stdout.toString() : e.toString();
  console.log(stdout.substring(0, 2000));
}
