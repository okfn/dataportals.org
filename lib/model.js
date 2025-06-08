import { readFile, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "csv-parse";
import { parse as parseSync } from "csv-parse/sync";
import marked from "marked";

class Catalog {
  constructor() {
    this._cache = new Map();
    this.total = 0;
  }

  clear() {
    this._cache.clear();
    this.total = 0;
  }

  load(catalogs) {
    for (const dp of catalogs) {
      dp.id = dp.name;
      dp.description_html = marked(dp.description);
      dp.tags = dp.tags || "";
      dp.tags = dp.tags.trim();
      dp.tags = dp.tags ? dp.tags.split(" ") : [];
      this._cache.set(dp.id, dp);
    }
    this.total = catalogs.length;
  }

  async loadFromFile(filePath) {
    const data = await readFile(filePath, "utf8");
    const output = await parse(data, { columns: true });
    this.load(output);
  }

  get(id) {
    return this._cache.get(id);
  }

  query(q) {
    // TODO: actual search
    return Array.from(this._cache.values());
  }
}

// Singleton catalog
const catalog = new Catalog();

const csvPath = join(
  import.meta.dirname || __dirname,
  "..",
  "data",
  "portals.csv",
);
const csvData = readFileSync(csvPath);
const jsonData = parseSync(csvData, { columns: true });
catalog.load(jsonData);

export { Catalog, catalog };
