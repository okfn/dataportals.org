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

Before treating an ENOTFOUND as a dead domain, confirm it with a resolver outside the local machine, like Google's DNS over HTTPS (`https://dns.google/resolve?name=<host>&type=A`, where `Status` 3 is NXDOMAIN and 2 is SERVFAIL). Local setups like Cloudflare WARP intercept queries to other resolvers such as `dig @8.8.8.8`, so those don't count as a second opinion.

Leave warnings (403, 429, 5xx, TLS errors, timeouts) alone unless the user asks. They are usually bot protection, a misconfigured certificate chain, or a site that is slow from the US, and those sites often work in a browser. Never mark a portal inactive based on a warning.

## 2. Find the current URL

The goal is the portal the publisher itself points people to now, not the first page that loads. Work through these in order for each broken portal:

1. **The publisher's own site.** Load the homepage of the old host and of the publisher's main domain (e.g. `https://www.tarragona.cat/` for `opendata.tarragona.cat`), and look for links whose text or URL mentions open data in the local language ("datos abiertos", "dati aperti", "offene Daten", "공공데이터", etc.). What the organization links to is the best answer. That's how Chile's `consejotransparencia.cl/datosabiertos/`, Palo Alto's `data.paloalto.gov`, and Windsor's Hub portal turned up.
1. **Sibling hostnames.** Try the old host with and without `www.`, and `data.`, `opendata.`, `open.`, and `bigdata.` on the publisher's domain. Watch for domain moves, like a city switching to `.gov` (`data.paloalto.gov`). Some domains (like `salford.gov.uk`) answer for any hostname, so a resolving name only counts if its page title names the publisher.
1. **Web search,** in the portal's language, for the title or publisher plus "open data", e.g. "Comune di Palermo dati aperti" or "대전광역시 공공데이터". If the first search comes up empty, try at least one more with different wording before giving up. Check press releases and national portal listings (e.g. datos.gob.es, data.gouv.fr, donneesquebec.ca). Search results go stale: a portal they describe as live may no longer resolve (Rome's and CLDF's did not), so verify every lead.
1. **The Wayback Machine** (`https://web.archive.org/web/2024*/<url>`) can show a "we've moved" notice on the last snapshot. It rate-limits quickly (429 after a handful of requests), so use it only for portals the steps above didn't solve, and space the requests out.

Common successors:

- A city's own ArcGIS Hub (`*.hub.arcgis.com`, `*.opendata.arcgis.com`) or Opendatasoft (`data.<city>.fr`) site
- A rename, like a "transparency portal" (Hamburg, Bremen) or "big data portal" (Gwangju, Daejeon) replacing the data portal
- A successor program, like NC OpenBook becoming NC OpenBudget
- A national or regional portal absorbing the local one. That usually means marking it inactive (see below), not repointing it.

When several URLs fit, prefer:

- a page on the organization's own domain over a platform's domain like `arcgis.com` or `seu-e.cat`, since it survives platform changes. Look for, in order:
  - the organization's hostname for its portal, even if it redirects to the platform (`data.fredericton.ca` over `data-fredericton.opendata.arcgis.com`)
  - the open data page on its main site (`www.kitchener.ca/opendata`)
  - the platform URL, only when the organization links straight to it and has no page of its own (Milton)
- the organization's own portal over a shared regional one (Niagara Region's `open.niagararegion.ca` over `niagaraopendata.ca`)
- the portal's front page over a deep link into its catalog

## 3. Verify the candidate

A candidate must pass all of these checks before it goes in:

- **It loads.** Use a full GET with redirects followed. Use the final URL if it redirects somewhere stable, but drop session IDs, tracking parameters, and language-selection pages.
- **It's the right organization.** The page title or heading names the publisher. This matters most for ArcGIS Hub, which returns 200 with the generic title "ArcGIS Hub" for any subdomain, including ones that don't exist. A Hub URL counts only if its `<title>` names the organization.
- **It's HTTPS.** `data/datapackage.json` rejects `http://` URLs.
- **It isn't already listed.** Search `data/portals.csv` for the candidate's host. If another row already uses it, don't create a duplicate. Merge the rows or mark this one inactive instead, as described in section 4.

Some portals only fail from a script (403 to bots, timeouts from the US, incomplete TLS chains). If a browser-style GET or `curl` shows the right page, that's enough. Say in the commit message that `check_urls.js` will warn on it.

## 4. Edit the data

- **Found where it moved:** change the `url` field. If the portal was renamed or rebranded along the way (NC OpenBook to NC OpenBudget), also update `title` to the new page's own name, and `description` if it describes the old portal (a beta phase, an old platform). Keep the `name`, so the page URL doesn't change.
- **Replaced by a portal that's already listed:** it depends on scope.
  - **Direct replacement of the same scope** (one national catalog replacing another, a beta becoming the production site): merge the rows. Delete the old row, copy its `tags` and `metadatacreated` into the successor's row where the successor's are empty, and add a 301 from `/portal/<old name>/` to `/portal/<successor name>/` in `netlify.toml`.
  - **A more specific portal absorbed by a more general one** (a city's portal by the national one, an environmental catalog by the national catalog): mark it `inactive` and add a sentence to the end of its `description` linking to the successor, e.g. "The city now publishes its open data on Peru's [Plataforma Nacional de Datos Abiertos](https://www.datosabiertos.gob.pe/)."
- **Directly replaced by a portal that isn't listed:** update the row to describe the replacement: its `url`, `title`, `description`, and any `tags` that no longer apply (like `ckan`). Keep the row's `name`, so its page URL doesn't change, and set `status` back to `active`. Make sure the replacement plays the same role. The IATI Registry's catalog role went to the IATI Dashboard, not to IATI Account, which only handles publisher accounts.
- **Positive evidence the portal is gone:** change only `status` to `inactive`. Inactive portals stay in the catalog and are skipped by the checker. Be conservative here. A dead domain shows the old URL is offline, not that the portal is gone: in the first pass of this cleanup, 18 of 74 portals marked inactive had in fact moved. Only mark a portal inactive after working through every step in section 2, and only with one of these:
  - an official shutdown or replacement notice (e.g. data.ox.ac.uk's end-of-life page)
  - a standalone project whose own domain has lapsed, confirmed by checking the registered domain itself, not just the portal's hostname (e.g. `opendatabc.ca`)
  - a deployment labeled as a test
- **Neither:** leave the row unchanged, including when only a subdomain of an organization that still exists is dead (`data.openpolice.ru`), or when a likely successor can't be verified. The checker will keep reporting it, and the summary should list it for a maintainer to decide.
- Edit rows in place with a targeted text replacement rather than rewriting the file through a CSV writer, which would requote every row and bury the change in the diff. Afterward, parse the old and new files and confirm that only the intended fields changed.
- Only write descriptions from what the new page or a source actually says. Leave a title alone when the new name can't be confirmed, like a page that blocks scripts.

Then validate:

```sh
uvx --from 'frictionless==5.*' frictionless validate data/datapackage.json
```

## 5. Commit

Make one commit for URL updates and one for status changes. In each commit body, give counts, a few examples, which old URLs failed and how, and any new URLs that `check_urls.js` will still warn on, with the reason. In the pull request or final message, list every portal that was marked inactive along with its evidence, so a maintainer can push back on any of them. Also list the broken portals that were left unchanged, with what was tried.
