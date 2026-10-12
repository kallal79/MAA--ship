const fs = require("fs");
const { execSync } = require("child_process");

execSync("git reset --hard HEAD", {stdio: "ignore"});
execSync("git clean -fd", {stdio: "ignore"});

const content = fs.readFileSync("packages/zod/src/v4/core/util.ts", "utf8");
const idx = content.indexOf("function shallowEqual");
if (idx !== -1) {
  console.log("Base shallowEqual:");
  console.log(content.substring(idx, idx + 1000));
}
