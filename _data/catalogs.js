// https://www.11ty.dev/docs/data-global/
// https://www.11ty.dev/docs/data-js/

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "csv-parse/sync";
import markdownit from "markdown-it";

// modifies the portals array
const formatData = (portals) => {
  const md = markdownit();

  for (const dp of portals) {
    dp.id = dp.name;
    dp.description_html = md.render(dp.description);
    dp.tags = dp.tags || "";
    dp.tags = dp.tags ? dp.tags.split(" ") : [];
  }

  // sort by title
  portals.sort((a, b) => a.title.localeCompare(b.title));
};

const csvPath = join(
  import.meta.dirname || __dirname,
  "..",
  "data",
  "portals.csv"
);
const csvData = readFileSync(csvPath);
const jsonData = parse(csvData, { columns: true, trim: true });
formatData(jsonData);

export default jsonData;
