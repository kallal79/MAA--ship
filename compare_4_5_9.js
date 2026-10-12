const fs = require('fs');

const p4 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_4/solution-patch.patch', 'utf8');
const p5 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_5/solution-patch.patch', 'utf8');
const p9 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_9/solution-patch.patch', 'utf8');

console.log('p4 length:', p4.length);
console.log('p5 length:', p5.length);
console.log('p9 length:', p9.length);

// Compare how each agent implemented $ZodDefault
console.log('\n--- AGENT 4 $ZodDefault ---');
const d4 = p4.match(/export const \$ZodDefault[\s\S]{1,1000}/);
if (d4) console.log(d4[0].slice(0, 500));

console.log('\n--- AGENT 5 $ZodDefault ---');
const d5 = p5.match(/export const \$ZodDefault[\s\S]{1,1000}/);
if (d5) console.log(d5[0].slice(0, 500));

console.log('\n--- AGENT 9 $ZodDefault ---');
const d9 = p9.match(/export const \$ZodDefault[\s\S]{1,1000}/);
if (d9) console.log(d9[0].slice(0, 500));
