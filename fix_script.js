const fs = require('fs');
let p = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/evaluate_now.cjs', 'utf8');
p = p.replace(/\{stdio: "ignore"\}/g, '{stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"}');
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/evaluate_now.cjs', p);
