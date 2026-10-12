const fs = require("fs");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/FINAL_SOLUTION_TO_UPLOAD.patch", "utf8");
console.log(content.match(/^diff --git a\/.*? b\/(.*?)$/gm));
