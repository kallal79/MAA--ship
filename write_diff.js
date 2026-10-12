const { execSync } = require('child_process');
const fs = require('fs');
const diff = execSync('git show HEAD --format=""', { encoding: 'utf8' });
fs.writeFileSync('c:/Users/USER/OneDrive/Desktop/MAA/FINAL_UPLOAD/test.patch', diff);
console.log("Wrote test.patch cleanly");
