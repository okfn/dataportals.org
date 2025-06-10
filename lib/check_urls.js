import { check } from "linkinator";
import records from "../_data/catalogs.js";

const urls = records
  .map((r) => r.url)
  .filter((u) => u && /^https?:\/\//.test(u))
  .slice(10);

const result = await check({
  path: urls,
  recurse: false,
  timeout: 10000,
  silent: true,
});
const broken = result.links.filter((l) => l.state === "BROKEN");
if (broken.length) {
  console.log("Broken or unreachable URLs:");
  broken.forEach((l) => console.log(`${l.url} -> ${l.status}`));
  process.exit(1);
} else {
  console.log("All URLs are reachable.");
}
