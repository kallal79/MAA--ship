const fs = require("fs");
const { execSync } = require("child_process");

// Check if Agent 5 implements shallow for Maps - look for Map in context of shallow
const content = fs.readFileSync("packages/zod/src/v4/core/schemas.ts", "utf8");
const idx = content.indexOf("\"shallow\"");
if (idx !== -1) {
  console.log("shallow context:");
  console.log(content.substring(Math.max(0, idx - 200), idx + 1500));
}
