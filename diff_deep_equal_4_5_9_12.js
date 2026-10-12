const fs = require('fs');

const p4 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_4/solution-patch.patch', 'utf8');
const p5 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_5/solution-patch.patch', 'utf8');
const p9 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_9/solution-patch.patch', 'utf8');
const p12 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_12/solution-patch.patch', 'utf8');

function getEqualityBlock(p) {
  const lines = p.split('\n');
  const eq = [];
  let recording = false;
  for (const l of lines) {
    if (l.includes('function equalDefault') || l.includes('function isDefaultEqual') || l.includes('function defaultValuesEqual') || l.includes('function deepEqual')) {
      recording = true;
    }
    if (recording) {
      eq.push(l);
      if (l.startsWith('//') && eq.length > 30) recording = false;
    }
  }
  return eq.join('\n');
}

console.log('=== AGENT 4 EQUALITY ===\n' + getEqualityBlock(p4));
console.log('\n=== AGENT 5 EQUALITY ===\n' + getEqualityBlock(p5));
console.log('\n=== AGENT 9 EQUALITY ===\n' + getEqualityBlock(p9));
console.log('\n=== AGENT 12 EQUALITY ===\n' + getEqualityBlock(p12));
