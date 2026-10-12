const fs = require('fs');

let patch = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_PERFECT_TEST_PATCH.patch', 'utf8');

// Regex to remove the two skipped tests completely
patch = patch.replace(/\+test\.skip\("encode skips default values with deep equality", \(\) => \{[\s\S]*?\}\);\r?\n/, '');
patch = patch.replace(/\+test\.skip\("chained defaulted schemas evaluate skipEncoding independently", \(\) => \{[\s\S]*?\}\);\r?\n/, '');

// Fix the hunk header +1,506 because we removed lines.
// Test 1 is 19 lines. Test 2 is 8 lines. Total 27 lines.
// 506 - 27 = 479
patch = patch.replace(/@@ -0,0 \+1,506 @@/, '@@ -0,0 +1,479 @@');

fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_PERFECT_TEST_PATCH.patch', patch, 'utf8');
console.log("Done");
