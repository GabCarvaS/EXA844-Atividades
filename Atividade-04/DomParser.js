const fs = require("fs").promises;
const { Console } = require("console");
const xml2js = require("xml2js");

async function parseOSMFile(filePath) {
  const fileContents = await fs.readFile(filePath, "utf-8");
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(fileContents);

  const nodes = result.osm.node;
  const amenities = [];

  for (const node of nodes) {
    const tags = node.tag;
    try {
      for (let j = 0; j < tags.length; j++) {
        const tag = tags[j];

        if (tag.$.k === "amenity") {
          const amenity = {
            id: node.$.id,
            lat: node.$.lat,
            lon: node.$.lon,
            nome: node.$.name,
            tipo: tag.$.v,
          };

          const nameTag = node.tag[j + 1];
          if (nameTag && nameTag.$.k === "name") {
            amenity.nome = nameTag.$.v;
          }
          amenities.push(amenity);
        }
      }
    } catch (error) {
      continue;
    }
  }

  return amenities;
}

module.exports = {
  parseOSMFile,
};
