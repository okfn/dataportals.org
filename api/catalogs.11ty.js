export default class Catalogs {
  data() {
    return {
      permalink: "/api/catalogs.json",
    };
  }

  render(data) {
    return JSON.stringify(data.catalogs);
  }
}
