const fs = require('fs');

const p4 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_4/solution-patch.patch', 'utf8');
const p5 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_5/solution-patch.patch', 'utf8');
const p9 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_9/solution-patch.patch', 'utf8');
const p12 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_12/solution-patch.patch', 'utf8');

function printJit(id, p) {
  console.log(`\n=================== AGENT ${id} JIT ===================`);
  const lines = p.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('$ZodObjectJIT') || lines[i].includes('doc.write')) {
      for (let j = Math.max(0, i - 2); j <= Math.min(lines.length - 1, i + 15); j++) {
        console.log(lines[j]);
      }
      i += 15;
    }
  }
}

printJit(4, p4);
printJit(5, p5);
printJit(9, p9);
printJit(12, p12);
