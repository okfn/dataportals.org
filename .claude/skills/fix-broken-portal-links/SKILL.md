---
name: fix-broken-portal-links
description: Research and fix broken portal URLs in data/portals.csv by finding each portal's current URL or marking it inactive. Use when the weekly "Check Portal URLs" workflow fails, when lib/check_urls.js reports BROKEN URLs, or when asked to fix dead portal links.
---

# Fix broken portal links

`lib/check_urls.js` finds broken URLs, and this skill fixes them. The script fails only on hard evidence that a portal is gone: the domain no longer resolves (ENOTFOUND), or the page returns 404/410 even after a GET retry. Everything else it prints as a warning.

## 1. Get the list

1. Run the checker and keep the `BROKEN:` lines:

   ```sh
   npm install
   node lib/check_urls.js 2>&1 | grep '^BROKEN:'
   ```

   If the user points at a failed workflow run, use the `BROKEN:` lines from its log instead (`gh run view <id> --log-failed`).

1. Look up each URL's row in `data/portals.csv` (`name`, `title`, `publisher`, `place`). Parse the file with a CSV parser, since some descriptions span several lines.

Leave warnings (403, 429, 5xx, TLS errors, timeouts) alone unless the user asks. They are usually bot protection, a misconfigured certificate chain, or a site that is slow from the US, and those sites often work in a browser. Never mark a portal inactive based on a warning.

## 2. Find the current URL

For each broken portal:

1. Load the site's homepage (`https://<host>/`). For a 404, the portal has often just moved within the same site.
1. Search the web for the portal's title or publisher plus "open data", in the portal's language, e.g. "Comune di Palermo dati aperti" or "대전광역시 공공데이터". Check government press releases and the national portal's listing (e.g. datos.gob.es, data.gouv.fr, donneesquebec.ca) for the current address.
1. Common successors:
   - A city's own ArcGIS Hub (`*.hub.arcgis.com`, `*.opendata.arcgis.com`) or Opendatasoft (`data.<city>.fr`) site
   - A rename, like a regional "transparency portal" replacing a data portal (Hamburg and Bremen)
   - A national or regional portal absorbing the local one. That usually means marking it inactive (see below), not repointing it.
1. The Wayback Machine (`https://web.archive.org/web/2024*/<url>`) can show a "we've moved" notice on the last snapshot. It rate-limits quickly (429 after a handful of requests), so use it only for portals that searching didn't solve, and space the requests out.

## 3. Verify the candidate

A candidate must pass all of these checks before it goes in:

- **It loads.** Use a full GET with redirects followed. Use the final URL if it redirects somewhere stable, but drop session IDs, tracking parameters, and language-selection pages.
- **It's the right organization.** The page title or heading names the publisher. This matters most for ArcGIS Hub, which returns 200 with the generic title "ArcGIS Hub" for any subdomain, including ones that don't exist. A Hub URL counts only if its `<title>` names the organization.
- **It's HTTPS.** `data/datapackage.json` rejects `http://` URLs.
- **It isn't already listed.** Search `data/portals.csv` for the candidate's host. If another row already uses it, mark this row inactive instead of creating a duplicate.

Some portals only fail from a script (403 to bots, timeouts from the US, incomplete TLS chains). If a browser-style GET or `curl` shows the right page, that's enough. Say in the commit message that `check_urls.js` will warn on it.

## 4. Edit the data

- **Found a successor:** change only the `url` field.
- **No successor, or successor already listed:** change only `status` to `inactive`. Inactive portals stay in the catalog and are skipped by the checker.
- Edit rows in place with a targeted text replacement rather than rewriting the file through a CSV writer, which would requote every row and bury the change in the diff. Afterward, parse the old and new files and confirm that only the intended fields changed.
- Don't edit titles or descriptions to match a new name unless the user asks.

Then validate:

```sh
uvx --from 'frictionless==5.*' frictionless validate data/datapackage.json
```

## 5. Commit

Make one commit for URL updates and one for status changes. In each commit body, give counts, a few examples, which old URLs failed and how, and any new URLs that `check_urls.js` will still warn on, with the reason. In the pull request or final message, list every portal that was marked inactive, so a maintainer can push back on any of them.
