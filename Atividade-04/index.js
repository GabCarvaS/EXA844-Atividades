const domParser = require("./DomParser.js");
const saxParser = require("./SaxParser.js");
const fs = require("fs");

const DomTest = async () => {
  console.time("dom");
  const amenities = await domParser.parseOSMFile("./map.osm");
  console.timeEnd("dom");

  fs.writeFile(
    "DataFromDom.json",
    JSON.stringify(amenities),
    "utf-8",
    (err) => {
      if (err) throw err;
      console.log("DataFromDom has been saved!");
    }
  );
};

const SaxTest = async () => {
  console.time("sax");
  const amenities = await saxParser.parseOSMFile("./map.osm");
  console.timeEnd("sax");

  fs.writeFile(
    "DataFromSax.json",
    JSON.stringify(amenities),
    "utf-8",
    (err) => {
      if (err) throw err;
      console.log("DataFromSax has been saved!");
    }
  );
};

DomTest();
SaxTest();
