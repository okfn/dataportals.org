export default class Data {
  data() {
    return {
      permalink: "/api/data.json",
    };
  }

  render(data) {
    const catalogsByName = {};
    for (const catalog of data.catalogs) {
      catalogsByName[catalog.name] = catalog;
    }
    return JSON.stringify(catalogsByName);
  }
}
