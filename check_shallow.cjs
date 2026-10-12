const fs = require("fs");
const content = fs.readFileSync("packages/zod/src/v4/core/schemas.ts", "utf8");
const idx = content.indexOf("shallow");
if (idx !== -1) {
  console.log("shallow found in schemas.ts:");
  console.log(content.substring(Math.max(0, idx - 500), idx + 1000));
}
