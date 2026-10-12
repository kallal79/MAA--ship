const fs = require('fs');

const p5 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_5/solution-patch.patch', 'utf8');

const lines = p5.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('function isDefaultEqual') || lines[i].includes('function deepEqual')) {
    console.log('=== MATCH AT LINE ' + i + ' ===');
    for (let j = Math.max(0, i - 2); j <= Math.min(lines.length - 1, i + 40); j++) {
      console.log(lines[j]);
    }
  }
}
