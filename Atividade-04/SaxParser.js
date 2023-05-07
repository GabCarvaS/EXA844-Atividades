const fs = require("fs");
const sax = require("sax");

function parseOSMFile(filename) {
  return new Promise((resolve, reject) => {
    const parser = sax.createStream(true);
    let currentNode = null;
    const establishments = [];

    parser.on("opentag", (tag) => {
      if (tag.name === "node") {
        currentNode = tag.attributes;
      } else if (
        tag.name === "tag" &&
        tag.attributes.k === "name" &&
        currentNode
      ) {
        currentNode.name = tag.attributes.v;
      } else if (
        tag.name === "tag" &&
        tag.attributes.k === "amenity" &&
        currentNode
      ) {
        currentNode.amenity = tag.attributes.v;
      }
    });

    parser.on("closetag", (tagName) => {
      if (tagName === "node" && currentNode && currentNode.name) {
        const lat = currentNode.lat;
        const lon = currentNode.lon;
        const tipo = currentNode.amenity || "";
        const nome = currentNode.name;

        establishments.push({ lat, lon, tipo, nome });

        currentNode = null;
      }
    });

    parser.on("end", () => {
      resolve(establishments);
    });

    parser.on("error", (error) => {
      reject(error);
    });

    fs.createReadStream(filename).pipe(parser);
  });
}

module.exports = {
  parseOSMFile,
};
