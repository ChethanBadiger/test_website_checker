// backend/db.js
const fs = require("fs");
const path = require("path");

const filePath = path.join("/tmp", "urls.json");

/** Ensure the JSON file exists */
function ensureFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ urls: [] }, null, 2));
  }
}

/** Read data */
function readData() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return { urls: [] };
  }
}

/** Write data */
function writeData(data) {
  ensureFile();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/** Insert URL and return updated array */
function insertUrl(url) {
  const data = readData();
  data.urls.push(url.trim());
  data.lastUpdated = new Date().toISOString();
  writeData(data);
  return { rowsInserted: 1, urls: data.urls };
}

/** Reset table and return empty array */
function resetTable() {
  const data = { urls: [], lastUpdated: new Date().toISOString() };
  writeData(data);
  return { reset: true, urls: [] };
}

module.exports = {
  insertUrl,
  resetTable,
};
