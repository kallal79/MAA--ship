const fs = require("fs");
const content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_5/solution-patch.patch", "utf8");
console.log(content.match(/ZodDefaultParams/g));
