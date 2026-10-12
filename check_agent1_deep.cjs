const fs = require("fs");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/FINAL_SOLUTION_TO_UPLOAD.patch", "utf8");
console.log(content.match(/function deepEqual.*?return true;\s*}/s)?.[0] || "No deepEqual");
