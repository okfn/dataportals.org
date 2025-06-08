import { catalog } from "../lib/model.js";

export default class Catalog {
  data() {
    // https://www.11ty.dev/docs/pagination/
    return {
      pagination: {
        data: "portals",
        size: 1,
        alias: "portal"
      },
      portals: catalog.query(),
      permalink: (data) => `/api/catalogs/${data.portal.id}.json`
    };
  }

  render(data) {
    return JSON.stringify(data.portal);
  }
}
