const fs = require("fs");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_5/solution-patch.patch", "utf8");
const idx = content.indexOf("function compareMembers");
if (idx !== -1) {
  console.log(content.substring(idx, idx + 1000));
} else {
  console.log("Not found compareMembers");
  const idx2 = content.indexOf("util.deepEqual");
  console.log("util.deepEqual found?", idx2 !== -1);
}
