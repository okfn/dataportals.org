export default class Catalogs {
  data() {
    return {
      permalink: "/api/catalogs.json",
    };
  }

  render(data) {
    const sortedData = data.catalogs.toSorted((a, b) =>
      a.name.localeCompare(b.name)
    );
    return JSON.stringify(sortedData);
  }
}
