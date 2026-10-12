const fs = require("fs");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/FINAL_SOLUTION_TO_UPLOAD.patch", "utf8");
const idx = content.indexOf("shallow");
if (idx !== -1) {
  console.log("shallow found in patch:");
  console.log(content.substring(Math.max(0, idx - 200), idx + 200));
}
