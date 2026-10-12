const fs = require("fs");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/core/schemas.ts", "utf8");
const match = content.indexOf("function handlePropertyResult");
console.log(content.substring(match, match + 500));
