const fs = require('fs');

const p4 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_4/solution-patch.patch', 'utf8');
const p5 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_5/solution-patch.patch', 'utf8');
const p9 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_9/solution-patch.patch', 'utf8');

console.log('=== AGENT 4 ===');
const m4 = p4.match(/function handleSkipEncoding[\s\S]{1,1200}/);
if (m4) console.log(m4[0].slice(0, 800));

console.log('\n=== AGENT 5 ===');
const m5 = p5.match(/function handleDefaultEncodeResult[\s\S]{1,1200}/);
if (m5) console.log(m5[0].slice(0, 800));

console.log('\n=== AGENT 9 ===');
const m9 = p9.match(/function handleDefaultEncodeResult[\s\S]{1,1200}|function handleSkipEncoding[\s\S]{1,1200}/);
if (m9) console.log(m9[0].slice(0, 800));
