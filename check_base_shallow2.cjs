const fs = require("fs");
const content = fs.readFileSync("packages/zod/src/v4/core/util.ts", "utf8");
const idx = content.indexOf("shallowEqual");
if (idx !== -1) {
  console.log("Base shallowEqual:");
  console.log(content.substring(idx, idx + 1000));
}
