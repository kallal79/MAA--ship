const fs = require("fs");
const { execSync } = require("child_process");

// Check how the inner payload.omitted flows to the outer default
// The inner returns a payload with omitted=true
// The outer's handleDefaultEncodeResult receives this payload
// The guard in handleDefaultEncodeResult only checks issues.length, not omitted
// But then it goes to compute the encoded default for comparison...
// Let me look at the actual code now

const content = fs.readFileSync("packages/zod/src/v4/core/schemas.ts", "utf8");
const idx = content.indexOf("handleDefaultEncodeResult");
console.log("handleDefaultEncodeResult location:", idx);
const snippet = content.substring(idx, idx + 2000);
console.log(snippet);
