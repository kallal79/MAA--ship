// Find differences between agent implementations using keyword comparison
const fs = require('fs');

const a1 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent1_diff.patch', 'utf8');
const a2 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent2_diff.patch', 'utf8');
const a3 = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/agent3_diff.patch', 'utf8');

// Extract specific functions
function findFunctions(diff, keywords) {
  const lines = diff.split('\n');
  let result = {};
  for (const kw of keywords) {
    result[kw] = lines.filter(l => l.includes(kw)).slice(0, 5).join('\n    ');
  }
  return result;
}

const kws = ['encodedDefault', 'defaultValue', 'omit', 'skipEncoding', 'NaN', 'sparse', 'WeakMap'];

console.log("=== AGENT 1 ===");
const a1res = findFunctions(a1, kws);
for (const [k, v] of Object.entries(a1res)) if (v) console.log(k + ':\n    ' + v + '\n');

console.log("=== AGENT 2 ===");
const a2res = findFunctions(a2, kws);
for (const [k, v] of Object.entries(a2res)) if (v) console.log(k + ':\n    ' + v + '\n');

console.log("=== AGENT 3 ===");
const a3res = findFunctions(a3, kws);
for (const [k, v] of Object.entries(a3res)) if (v) console.log(k + ':\n    ' + v + '\n');
