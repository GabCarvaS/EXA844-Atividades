const {
  parseHTML,
  parseHTMLFromLinksFile,
  buildHTMLPage,
} = require("./parser.js");
const fs = require("fs");

parseHTMLFromLinksFile("seeds.txt")
  .then((results) => {
    const html = buildHTMLPage(results);
    fs.writeFileSync("results.html", html);
    console.log("HTML page created successfully.");
  })
  .catch((error) => {
    console.error(error);
  });
