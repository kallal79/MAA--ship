const fs = require("fs");
const cp = require("child_process");

cp.execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/FINAL_SOLUTION_TO_UPLOAD.patch"`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});

const testContent = `
import { expect, test } from "vitest";
import { z } from "./packages/zod/src/index.ts";

test("trigger runtime error", () => {
  const d1 = new Date("2026-01-01");
  const d2 = new Date("2026-01-02");
  const schema = z.any().default(d1, { skipEncoding: true });
  console.log("Encoding...");
  try {
    schema.encode(d2);
    console.log("Encoded!");
  } catch(e) {
    console.log("CAUGHT:", e);
  }
});
`;

let content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8");
fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", content + "\n" + testContent);

cp.execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t \"trigger runtime\"", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "inherit"});
