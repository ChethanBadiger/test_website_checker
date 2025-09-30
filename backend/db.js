const Database = require("better-sqlite3");

const db = new Database("data.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT
  )
`).run();

// insert helper
function insertUrl(url) {
  const stmt = db.prepare("INSERT INTO records (url) VALUES (?)");
  return stmt.run(url.trim());
}

// reset helper (delete + reset AUTOINCREMENT)
function resetTable() {
  db.prepare("DELETE FROM records").run();
  db.prepare("DELETE FROM sqlite_sequence WHERE name = 'records'").run();
}

module.exports = {
  insertUrl,
  resetTable,
  db,
};
