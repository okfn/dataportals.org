import { catalog } from "../lib/model.js";

export default class Catalogs {
  data() {
    return {
      permalink: "/api/catalogs.json",
    };
  }

  render(data) {
    return JSON.stringify(catalog.query());
  }
}
