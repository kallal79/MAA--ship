const fs = require("fs");
if (fs.existsSync("final_verification_results.md")) {
  console.log(fs.readFileSync("final_verification_results.md", "utf8"));
} else if (fs.existsSync("../final_verification_results.md")) {
  console.log(fs.readFileSync("../final_verification_results.md", "utf8"));
} else {
  console.log("Not found");
}
