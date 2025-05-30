const model = require("../lib/model.js");

class Data {
  data() {
    return {
      permalink: "/api/data.json",
    };
  }

  render(data) {
    return JSON.stringify(model.catalog._cache);
  }
}

module.exports = Data;
