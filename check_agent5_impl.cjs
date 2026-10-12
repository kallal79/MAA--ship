const fs = require("fs");
const { execSync } = require("child_process");

// Agent 5 doesn't have shallowEqual at all! That means its implementation is completely different.
// Maybe it implements shallow comparison differently (inline in handleDefaultEncodeResult?).
// Let me look at Agent 5's schemas.ts for comparison logic

const content = fs.readFileSync("packages/zod/src/v4/core/schemas.ts", "utf8");
const idx = content.indexOf("skipEncoding");
if (idx !== -1) {
  console.log("Agent 5 skipEncoding reference:");
  console.log(content.substring(idx, idx + 500));
} else {
  console.log("skipEncoding not found in schemas.ts");
  // Maybe it's in classic schemas
  const classical = fs.readFileSync("packages/zod/src/v4/classic/schemas.ts", "utf8");
  const idx2 = classical.indexOf("skipEncoding");
  if (idx2 !== -1) {
    console.log("Found in classic/schemas.ts at:", idx2);
    console.log(classical.substring(idx2, idx2 + 500));
  }
}
