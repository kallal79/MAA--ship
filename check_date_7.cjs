const fs = require("fs");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_7/solution-patch.patch", "utf8");
console.log(content.match(/Date/g));
const lines = content.split("\n");
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("Date")) {
    console.log(lines.slice(Math.max(0, i-5), Math.min(lines.length, i+5)).join("\n"));
  }
}
