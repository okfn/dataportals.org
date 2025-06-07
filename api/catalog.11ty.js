const model = require("../lib/model.js");

class Catalog {
  data() {
    // https://www.11ty.dev/docs/pagination/
    return {
      pagination: {
        data: "portals",
        size: 1,
        alias: "portal"
      },
      portals: model.catalog.query(),
      permalink: function(data) {
        return `/api/catalogs/${data.portal.id}.json`;
      }
    };
  }

  render(data) {
    return JSON.stringify(data.portal);
  }
}

module.exports = Catalog;
