// backend/db.js
const fs = require("fs");
const path = require("path");

const filePath = path.join(process.cwd(), "data", "urls.json");

/** Ensure the data directory and JSON file exist */
function ensureFile() {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ urls: [] }, null, 2));
  }
}

/** Read data from the JSON file */
function readData() {
  ensureFile();
  const raw = fs.readFileSync(filePath, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return { urls: [] };
  }
}

/** Write data to the JSON file */
function writeData(data) {
  ensureFile();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/** Insert a new URL */
function insertUrl(url) {
  const data = readData();
  data.urls.push(url.trim());
  data.lastUpdated = new Date().toISOString();
  writeData(data);
  return { rowsInserted: 1 };
}

/** Reset (clear) the stored URLs */
function resetTable() {
  const data = { urls: [], lastUpdated: new Date().toISOString() };
  writeData(data);
  return { reset: true };
}

module.exports = {
  insertUrl,
  resetTable,
};
