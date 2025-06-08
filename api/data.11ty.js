import { catalog } from "../lib/model.js";

export default class Data {
  data() {
    return {
      permalink: "/api/data.json",
    };
  }

  render(data) {
    return JSON.stringify(Array.from(catalog._cache.values()));
  }
}
