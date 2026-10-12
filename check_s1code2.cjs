const fs = require("fs");
const { execSync } = require("child_process");

const content = fs.readFileSync("packages/zod/src/v4/core/schemas.ts", "utf8");
const idx = content.indexOf("function handleDefaultEncodeResult");
const snippet = content.substring(idx, idx + 3000);
console.log(snippet);
