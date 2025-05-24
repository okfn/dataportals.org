const model = require("../lib/model.js");

class PortalsData {
  data() {
    return {
      permalink: "/api/catalogs.json",
    };
  }

  render(data) {
    return JSON.stringify(model.catalog.query());
  }
}

module.exports = PortalsData;
