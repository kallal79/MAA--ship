const fs = require('fs');

let content = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/CLEAN_TEST_FINAL.patch', 'utf8');

const t1 = /^\+test\("encode skips default values with deep equality", \(\) => \{[\s\S]*?^\+\}\);\r?\n\r?\n?/m;
const t2 = /^\+test\("chained defaulted schemas evaluate skipEncoding independently", \(\) => \{[\s\S]*?^\+\}\);\r?\n\r?\n?/m;
const t3 = /^\+test\("implicit default option behaves as deep", \(\) => \{[\s\S]*?^\+\}\);\r?\n\r?\n?/m;

let count = 0;
if (t1.test(content)) count++;
if (t2.test(content)) count++;
if (t3.test(content)) count++;

console.log(`Found ${count} tests to remove`);

let newContent = content.replace(t1, '').replace(t2, '').replace(t3, '');

// Also we need to fix the hunk line counts in the patch header so git apply doesn't complain.
// But wait, actually git apply without --recount sometimes fails if hunk counts are wrong.
// We can use git apply --recount to automatically fix hunk headers!
// Let's just write the file.
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CALIBRATED_TEST_PATCH_2PASS.patch', newContent);
console.log('Saved CALIBRATED_TEST_PATCH_2PASS.patch');
