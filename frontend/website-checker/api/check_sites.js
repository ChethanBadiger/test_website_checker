import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const filePath = path.join("/tmp", "urls.json"); // JSON file for URLs

/** Ensure JSON file exists */
function ensureFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ urls: [] }, null, 2));
  }
}

/** Read URLs from JSON file */
function readUrls() {
  ensureFile();
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return data.urls || [];
  } catch {
    return [];
  }
}

function safeFilename(url) {
  return url.replace(/[:\/\\?%*|"<>]/g, "_");
}

async function checkSite(url) {
  const res = {
    url,
    errors: [],
    status: "Good",
    finalUrl: null,
    screenshotPath: null,
    log: null,
  };

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();

  try {
    const response = await page.goto(url, { timeout: 30000, waitUntil: "domcontentloaded" });
    res.finalUrl = page.url();

    const redirectCount = response.request().redirectChain().length;
    if (redirectCount > 3) res.errors.push("too many redirects");

    const content = await page.content();
    if (/too many redirects|redirected you too many times/i.test(content)) {
      res.errors.push("Site is being redirected");
      res.status = "too many redirects";
    }

    if (/(SQL syntax|mysqli|PDOException|ORA-|error establishing a database connection|database error)/i.test(content)) {
      res.errors.push("Database error detected");
      res.status = "Bad";
    }

    const outputDir = path.resolve("/tmp/screenshots");
    await fs.promises.mkdir(outputDir, { recursive: true });

    const fname = safeFilename(url) + ".png";
    const fullPath = path.join(outputDir, fname);
    await page.screenshot({ path: fullPath, fullPage: true });
    res.screenshotPath = `/screenshots/${fname}`; // relative path

  } catch (error) {
    const msg = error.message || "";
    if (/SSL|CERT|certificate/i.test(msg)) res.errors.push("ssl error");
    else if (/Timeout|Navigation|ENOTFOUND|ERR_NAME_NOT_RESOLVED/i.test(msg)) res.errors.push("site unreachable");
    else res.errors.push("other: " + msg.slice(0, 200));

    res.status = "Bad";
  } finally {
    await browser.close();
    const now = new Date();
    res.log = `Check finished at: ${now.toISOString()}`;
  }

  return res;
}

async function checkAllSites() {
  const urls = readUrls(); // read from JSON file
  const results = [];
  for (const url of urls) {
    try {
      const siteResult = await checkSite(url);
      results.push(siteResult);
    } catch (err) {
      console.error("Error checking site:", url, err.message);
    }
  }
  return results;
}

// Serverless handler
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const results = await checkAllSites();
    return res.status(200).json(results);
  } catch (err) {
    console.error("check_sites error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
