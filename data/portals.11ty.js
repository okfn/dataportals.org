const model = require("../lib/model.js");
const csvparse = require("csv-parse/sync");
const fs = require("node:fs");
const path = require("node:path");

const csvPath = path.join(__dirname, "/portals.csv");
const csvData = fs.readFileSync(csvPath);
const jsonData = csvparse.parse(csvData, { columns: true });
model.catalog.load(jsonData);

// https://www.11ty.dev/docs/languages/javascript/#classes
class PortalsData {
  data() {
    return {
      permalink: "/api/data.json",
    };
  }

  render(data) {
    return JSON.stringify(model.catalog._cache);
  }
}

module.exports = PortalsData;
