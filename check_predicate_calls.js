const fs = require('fs');
const path = require('path');

const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';

for (let i = 1; i <= 13; i++) {
  const p = path.join(AGENT_DIR, `Nova_Nova_${i}`, 'solution-patch.patch');
  if (!fs.existsSync(p)) continue;
  const content = fs.readFileSync(p, 'utf8');
  
  // Extract lines where skipEncoding is called as a function
  const lines = content.split('\n');
  const calls = lines.filter(l => l.includes('skipEncoding(') || l.includes('opt(') || l.includes('predicate(') || l.includes('.skipEncoding'));
  console.log(`\n=== AGENT ${i} ===`);
  for (const c of calls) {
    if (c.startsWith('+') && (c.includes('(') || c.includes('defaultValue'))) {
      console.log('  ' + c.trim());
    }
  }
}
