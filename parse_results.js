const fs = require('fs');

const text = fs.readFileSync('C:\\Users\\USER\\OneDrive\\Desktop\\MAA\\user_input.txt', 'utf8');

const lines = text.split('\n');
let solved = 0;
let missed = 0;
let env = 0;
let regression = 0;
let total = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === 'Solver: Nova · Eval: Nova') {
        total++;
        let nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
        if (nextLine === 'Solved') solved++;
        else if (nextLine === 'Missed Requirement') missed++;
        else if (nextLine === 'Undocumented Req') env++;
        else if (nextLine === 'Regression') regression++;
    }
}

console.log(`--- NOVA ALL AGENT RESULT ---`);
console.log(`Total Nova Runs: ${total}`);
console.log(`✅ Solved: ${solved}`);
console.log(`❌ Missed Requirement: ${missed}`);
console.log(`⚠️ Undocumented Req / Env: ${env}`);
console.log(`🔄 Regression: ${regression}`);
console.log(`-----------------------------`);
console.log(`Overall Pass Rate: ${((solved/total)*100).toFixed(2)}%`);
