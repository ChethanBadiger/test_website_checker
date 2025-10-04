const Database = require("better-sqlite3");

function withDb(fn) {
  const db = new Database("data.db");
  try {
    // ensure schema exists
    db.prepare(`
      CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT
      )
    `).run();

    return fn(db);
  } finally {
    db.close(); // 👈 closes every time
  }
}

function insertUrl(url) {
  return withDb((db) => {
    const stmt = db.prepare("INSERT INTO records (url) VALUES (?)");
    return stmt.run(url.trim());
  });
}

function resetTable() {
  return withDb((db) => {
    db.prepare("DELETE FROM records").run();
    db.prepare("DELETE FROM sqlite_sequence WHERE name = 'records'").run();
  });
}

module.exports = {
  insertUrl,
  resetTable,
};
