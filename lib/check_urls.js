import records from "../_data/catalogs.js";
// use undici's fetch rather than the global one, since Node's bundled undici (6.x in Node 22) rejects this package's Agent with "invalid onRequestStart method"
import { Agent, fetch } from "undici";

const TIMEOUT_IN_MS = 20 * 1000;
// connection timeout
// https://stackoverflow.com/a/77319848/358804
const AGENT = new Agent({ connectTimeout: TIMEOUT_IN_MS });
// starting all ~700 requests at once makes many of them time out
const CONCURRENCY = 25;

const getUrls = () => {
  // inactive portals are known to be offline
  return records.filter((r) => r.status !== "inactive").map((r) => r.url);
};

// DNS failures and these statuses mean the portal is gone. Anything else (403, 429, 5xx, TLS errors, timeouts) is often bot protection or a temporary outage, so it's only a warning.
const GONE_STATUSES = [404, 410];

const request = (url, method) =>
  fetch(url, {
    method,
    headers: {
      Accept: "text/html",
      "User-Agent": "https://dataportals.org/ bot",
    },
    redirect: "follow",
    dispatcher: AGENT,
    // response timeout, created per request so that it doesn't start counting until this request does
    signal: AbortSignal.timeout(TIMEOUT_IN_MS),
  });

const describeError = (error) => {
  const cause = error.cause || {};
  return {
    dnsFailed: (cause.code || error.code) === "ENOTFOUND",
    msg: (cause.message || error.message || String(error)).trim(),
  };
};

// Returns {result: "ok" | "broken" | "unknown", msg}.
const checkUrl = async (url) => {
  try {
    const head = await request(url, "HEAD");
    if (head.ok) return { result: "ok" };
  } catch (error) {
    const { dnsFailed } = describeError(error);
    if (dnsFailed)
      return { result: "broken", msg: "could not be found (ENOTFOUND)" };
  }

  // some servers reject or mishandle HEAD, so retry with GET before deciding
  try {
    const get = await request(url, "GET");
    // don't download the body
    await get.body?.cancel();
    if (get.ok) return { result: "ok" };
    const result = GONE_STATUSES.includes(get.status) ? "broken" : "unknown";
    return { result, msg: `has status ${get.status}` };
  } catch (error) {
    const { dnsFailed, msg } = describeError(error);
    return dnsFailed
      ? { result: "broken", msg: "could not be found (ENOTFOUND)" }
      : { result: "unknown", msg: `failed: ${msg}` };
  }
};

const run = async () => {
  const queue = getUrls();
  const counts = { ok: 0, broken: 0, unknown: 0 };
  const worker = async () => {
    while (queue.length) {
      const url = queue.shift();
      const { result, msg } = await checkUrl(url);
      counts[result]++;
      if (result === "broken") console.error(`BROKEN: ${url} ${msg}`);
      if (result === "unknown") console.warn(`warning: ${url} ${msg}`);
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log(
    `\n${counts.ok} OK, ${counts.broken} broken, ${counts.unknown} couldn't be confirmed.`,
  );
  if (counts.broken > 0) process.exit(1);
  // every request erroring means the checker itself is broken, not the portals
  if (counts.ok === 0) {
    console.error("No URLs could be checked.");
    process.exit(1);
  }
};

run();
