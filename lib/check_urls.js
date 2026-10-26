import records from "../_data/catalogs.js";
import { Agent } from "undici";

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

const handleError = (url, error) => {
  const cause = error.cause || {};
  const code = cause.code || error.code;
  if (code === "ENOTFOUND") {
    console.error(`${url} could not be found (ENOTFOUND)`);
  } else {
    const msg = cause.message || error.message || error;
    console.error(`${url} failed:`, msg);
  }
};

const checkUrl = async (url) => {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      headers: {
        Accept: "text/html",
        "User-Agent": "https://dataportals.org/ bot",
      },
      redirect: "follow",
      dispatcher: AGENT,
      // response timeout, created per request so that it doesn't start counting until this request does
      signal: AbortSignal.timeout(TIMEOUT_IN_MS),
    });

    if (!response.ok) {
      console.warn(`${url} has status ${response.status}`);
      return false;
    }
  } catch (error) {
    handleError(url, error);
    return false;
  }

  return true;
};

const run = async () => {
  const queue = getUrls();
  let failures = 0;
  const worker = async () => {
    while (queue.length) {
      const ok = await checkUrl(queue.shift());
      if (!ok) failures++;
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  if (failures > 0) {
    console.error(`\n${failures} URL(s) failed.`);
    process.exit(1);
  } else {
    console.log("All URLs OK.");
  }
};

run();
