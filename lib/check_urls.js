import records from "../_data/catalogs.js";

const checkUrl = async (url) => {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(10 * 1000),
    });

    const status = response.status;
    if (status < 200 || status >= 300) {
      console.warn(`${url} has status ${status}`);
    }
  } catch (error) {
    const code = error.cause.code || error.code;
    if (code === "ENOTFOUND") {
      console.error(`${url} could not be found (ENOTFOUND)`);
    } else {
      const msg = error.cause.message || error.message || error;
      console.error(`${url} failed:`, msg);
    }
  }
};

const urls = records
  .map((r) => r.url)
  .filter((u) => u && /^https?:\/\//.test(u));

console.log(urls);
urls.forEach(checkUrl);
