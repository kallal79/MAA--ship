const fs = require("fs");
const lines = fs.readFileSync("C:/Users/USER/.gemini/antigravity-ide/brain/f2af7cbb-923b-42de-9188-409966b47723/.system_generated/logs/transcript.jsonl", "utf8").split("\n");
let inTask3380 = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("task-3380")) {
    console.log(lines[i].substring(0, 1000));
  }
}
