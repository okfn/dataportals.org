import fs from 'node:fs';
import { parse } from 'csv-parse/sync';
import { check } from 'linkinator';

const CSV_PATH = 'data/portals.csv';

const csv = fs.readFileSync(CSV_PATH, 'utf8');
const records = parse(csv, { columns: true, skip_empty_lines: true });
const urls = records.map(r => r.url && r.url.trim()).filter(u => u && /^https?:\/\//.test(u));

(async () => {
  const result = await check({
    path: urls,
    recurse: false,
    timeout: 10000,
    silent: true,
  });
  const broken = result.links.filter(l => l.state === 'BROKEN');
  if (broken.length) {
    console.log('Broken or unreachable URLs:');
    broken.forEach(l => console.log(`${l.url} -> ${l.status}`));
    process.exit(1);
  } else {
    console.log('All URLs are reachable.');
  }
})();
