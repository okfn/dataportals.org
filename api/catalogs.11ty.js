const model = require("../lib/model.js");

class Catalogs {
  data() {
    return {
      permalink: "/api/catalogs.json",
    };
  }

  render(data) {
    return JSON.stringify(model.catalog.query());
  }
}

module.exports = Catalogs;
