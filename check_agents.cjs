const fs = require('fs');
const md = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/zod/final_verification_results.md', 'utf8');
const match = md.match(/\*\*Total Passing Agents:\*\* (\d+)\/12/);
console.log('Passing Agents:', match ? match[1] : 'Error');
