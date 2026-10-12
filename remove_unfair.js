const fs = require('fs');

let code = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH_V8_EXECUTABLE.patch', 'utf8');
const testsToRemove = [
  'encode skips default values in arrays',
  'encode skips default values in sets',
  'encode correctly processes un-omitted array elements following omitted ones (LLM trap)',
  'cascading omission from elements to parent container'
];

let lines = code.split('\n');
let inTest = false;
let newLines = [];

for (let line of lines) {
  if (line.startsWith('+test(')) {
    let testName = line.match(/\+test\(['"](.*?)['"]/)[1];
    if (testsToRemove.includes(testName)) {
      inTest = true;
      continue;
    }
  }
  if (inTest) {
    if (line === '+});' || line === '+})') {
      inTest = false;
    }
    continue;
  }
  newLines.push(line);
}

fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH_V9_FAIR.patch', newLines.join('\n'), 'utf8');
console.log('Done!');
