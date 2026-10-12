const fs = require('fs');

let content = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH_V14_TRAPS_AND_FIX.patch', 'utf-8');

function removeTest(testName) {
  const startStr = '+test("' + testName + '"';
  let startIndex = content.indexOf(startStr);
  if (startIndex === -1) {
    console.log("Could not find " + testName);
    return;
  }
  let endIndex = content.indexOf('+});\n+', startIndex);
  if (endIndex === -1) {
    console.log("Could not find end of " + testName);
    return;
  }
  endIndex += 5; // length of '+});\n'
  content = content.substring(0, startIndex) + content.substring(endIndex);
}

removeTest("encode skips default values in arrays");
removeTest("encode skips default values in sets");
removeTest("encode correctly processes un-omitted array elements following omitted ones (LLM trap)");
removeTest("cascading omission from elements to parent container");

fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH_V14_TRAPS_AND_FIX.patch', content, 'utf-8');
console.log("Done");
