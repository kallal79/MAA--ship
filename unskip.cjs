const fs = require('fs');
let txt = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_PERFECT_TEST_PATCH.patch', 'utf8');
txt = txt.replace(/\+test\.skip\(/g, '+test(');
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_PERFECT_TEST_PATCH.patch', txt);
console.log("Unskipped tests in test patch");
