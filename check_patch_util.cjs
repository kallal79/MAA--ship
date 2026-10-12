const fs = require("fs");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/FINAL_SOLUTION_TO_UPLOAD.patch", "utf8");
console.log("util.ts in patch?", content.includes("packages/zod/src/v4/core/util.ts"));
