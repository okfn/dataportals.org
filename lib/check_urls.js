import records from "../_data/catalogs.js";

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
      redirect: "follow",
      signal: AbortSignal.timeout(10 * 1000),
    });

    const status = response.status;
    if (status < 200 || status >= 300) {
      console.warn(`${url} has status ${status}`);
      return false;
    }
  } catch (error) {
    handleError(url, error);
    return false;
  }

  return true;
};

const run = () => {
  const urls = records
    .map((r) => r.url)
    .filter((u) => u && /^https?:\/\//.test(u));

  urls.forEach(checkUrl);
};

run();
