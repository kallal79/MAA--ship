const fs = require("fs");
const lines = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/core/schemas.ts", "utf8").split("\n");
let count = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("RETURN_FALSE_18")) {
    console.log("LINE", i + 1, ":", lines.slice(i - 3, i + 4).join("\n"));
  }
}
