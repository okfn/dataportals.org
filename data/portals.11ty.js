const model = require("../lib/model.js");

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
