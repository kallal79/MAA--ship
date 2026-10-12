const fs = require('fs');
let txt = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH_V3.patch', 'utf8');
txt = txt.replace(/\+test\.skip\(/g, '+test(');
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_PERFECT_TEST_PATCH.patch', txt);
console.log("Done copying and replacing");
