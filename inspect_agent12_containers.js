const fs = require('fs');
const path = require('path');

const p = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_12/solution-patch.patch';
const content = fs.readFileSync(p, 'utf8');

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ZodRecord') || lines[i].includes('ZodTuple') || lines[i].includes('ZodArray') || lines[i].includes('ZodMap') || lines[i].includes('ZodSet')) {
    console.log(`\n--- Line ${i}: ${lines[i]} ---`);
    for (let j = Math.max(0, i - 2); j <= Math.min(lines.length - 1, i + 25); j++) {
      console.log(lines[j]);
    }
  }
}
