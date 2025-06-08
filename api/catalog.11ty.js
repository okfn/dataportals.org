export default class Catalog {
  data() {
    // https://www.11ty.dev/docs/pagination/
    return {
      pagination: {
        data: "catalogs",
        size: 1,
        alias: "catalog",
      },
      permalink: (data) => `/api/catalogs/${data.catalog.name}.json`,
    };
  }

  render(data) {
    return JSON.stringify(data.catalog);
  }
}
