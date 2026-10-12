const fs = require("fs");
const { execSync } = require("child_process");

const content = fs.readFileSync("packages/zod/src/v4/core/schemas.ts", "utf8");
// Find the $ZodDefault parse function (the one that handles backward direction with skipEncoding)
const idx = content.indexOf("export const $ZodDefault:");
console.log("$ZodDefault at:", idx);
const snippet = content.substring(idx, idx + 1500);
console.log(snippet);
