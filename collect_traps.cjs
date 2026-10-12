const fs = require('fs');

const r1 = JSON.parse(fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/trap_results.json'));
const r2 = JSON.parse(fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/trap_results_2.json'));
const r3 = JSON.parse(fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/trap_results_3.json'));
const r4 = JSON.parse(fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/trap_results_4.json'));
const r6 = JSON.parse(fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/trap_results_6.json'));
const r7 = JSON.parse(fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/trap_results_7.json'));

const allTraps = {};

for (let i = 1; i <= 12; i++) {
  const agentFailures = [];
  const check = (resultsList) => {
    for (const res of resultsList) {
      if (res.endsWith('failed')) {
        agentFailures.push(res.split(':')[0]);
      }
    }
  };
  check(r1[i] || []);
  check(r2[i] || []);
  check(r3[i] || []);
  check(r4[i] || []);
  check(r6[i] || []);
  check(r7[i] || []);
  allTraps[i] = agentFailures;
}

console.log(allTraps);
