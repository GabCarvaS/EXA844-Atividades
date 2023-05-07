const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

async function parseHTML(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const title = $("title").text();
    const firstImage = $("img").first().attr("src");
    return { title, firstImage };
  } catch (error) {
    throw error;
  }
}

async function parseHTMLFromLinksFile(filePath) {
  try {
    const data = await fs.promises.readFile(filePath, "utf8");
    const urls = data.split("\n");
    const results = [];

    for (const url of urls) {
      try {
        const result = await parseHTML(url.trim());
        results.push({ url, ...result });
      } catch (error) {
        results.push({ url, error: error.message });
      }
    }

    return results;
  } catch (error) {
    throw error;
  }
}

function buildHTMLPage(data) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>HTML Parser Results</title>
      </head>
      <body>
        <h1>HTML Parser Results</h1>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Title</th>
              <th>First Image</th>
            </tr>
          </thead>
          <tbody>
            ${data
              .map(
                (item) => `
              <tr>
                <td>${item.url}</td>
                <td>${item.title}</td>
                <td><img src="${item.firstImage}" /></td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;
  return html;
}

module.exports = { parseHTML, parseHTMLFromLinksFile, buildHTMLPage };
