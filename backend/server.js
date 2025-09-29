const express = require("express");
const multer = require("multer");
const Database = require("better-sqlite3");
const fs = require("fs");
const csv = require("csv-parser");

const app = express();
const upload = multer({ dest: "uploads/" });

// setup SQLite database
const db = new Database("data.db");

// create table with only id + url
db.prepare(`
  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT
  )
`).run();

// API endpoint
app.post("/upload", upload.single("csv"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "CSV file is required" });
  }

  const filePath = req.file.path;
  let rowCount = 0;

  const insertStmt = db.prepare("INSERT INTO records (url) VALUES (?)");

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      // look for a column named 'url' or 'URL'
      const foundUrl = row.url || row.URL;
      if (foundUrl && foundUrl.trim() !== "") {
        insertStmt.run(foundUrl.trim());
        rowCount++;
      }
    })
    .on("end", () => {
      fs.unlinkSync(filePath); // cleanup uploaded file
      res.json({
        message: "Data inserted successfully",
        rowsInserted: rowCount,
      });
    })
    .on("error", (err) => {
      console.error("CSV parse error:", err);
      res.status(500).json({ error: "Failed to parse CSV" });
    });
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
