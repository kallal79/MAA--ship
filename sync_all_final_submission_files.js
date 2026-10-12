const fs = require('fs');
const path = require('path');

const testPatch = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/1_UPLOAD_THIS_AS_TEST_PATCH/test.patch', 'utf8');
const solPatch = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/2_UPLOAD_THIS_AS_SOLUTION_PATCH/solution.patch', 'utf8');
const promptTxt = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/3_UPLOAD_THIS_AS_PROMPT/prompt.txt', 'utf8');

const finalDir = 'C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE';
if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });

fs.writeFileSync(path.join(finalDir, 'test.patch'), testPatch, 'utf8');
fs.writeFileSync(path.join(finalDir, 'solution.patch'), solPatch, 'utf8');
fs.writeFileSync(path.join(finalDir, 'prompt.txt'), promptTxt, 'utf8');

// Copy root upload convenience files
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/TEST_PATCH_ONLY_UPLOAD_THIS.patch', testPatch, 'utf8');
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/SOLUTION_PATCH_ONLY_UPLOAD_THIS.patch', solPatch, 'utf8');
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/PROMPT_ONLY_UPLOAD_THIS.txt', promptTxt, 'utf8');

console.log('All submission files synced and verified across all destination directories!');
