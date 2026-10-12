const fs = require("fs");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/schemas.ts", "utf8");
const match = content.match(/function handlePropertyResult[\s\S]*?(?=\n\+function|function\s+[a-zA-Z0-9_]+\()/);
if (match) console.log(match[0].substring(0, 1000));
