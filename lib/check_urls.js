import records from "../_data/catalogs.js";
import { Agent } from "undici";

const TIMEOUT_IN_MS = 20 * 1000;
// connection timeout
// https://stackoverflow.com/a/77319848/358804
const AGENT = new Agent({ connectTimeout: TIMEOUT_IN_MS });
// response timeout
const SIGNAL = AbortSignal.timeout(TIMEOUT_IN_MS);

const getUrls = () => {
  return records.map((r) => r.url).filter((u) => u && /^https?:\/\//.test(u));
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
      signal: SIGNAL,
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

const run = () => {
  const urls = getUrls();
  urls.forEach(checkUrl);
};

run();
