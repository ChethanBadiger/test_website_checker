const express = require("express");
const multer = require("multer");
const Database = require("better-sqlite3");
const fs = require("fs");
const csv = require("csv-parser");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json()); // allow JSON bodies

// setup SQLite database
const db = new Database("data.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT
  )
`).run();


// ----------- Endpoint: Insert single URL -----------
app.post("/upload-url", (req, res) => {
  const { url } = req.body;

  if (!url || !url.startsWith("http")) {
    return res.status(400).json({ error: "A valid URL is required" });
  }

  const insertStmt = db.prepare("INSERT INTO records (url) VALUES (?)");
  insertStmt.run(url.trim());

  res.json({
    message: "Single URL inserted successfully",
    rowsInserted: 1,
  });
});


// ----------- Endpoint: Insert from CSV file -----------
app.post("/upload-csv", upload.single("csv"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "CSV file is required" });
  }

  const filePath = req.file.path;
  let rowCount = 0;

  const insertStmt = db.prepare("INSERT INTO records (url) VALUES (?)");

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      // scan all columns for something that looks like a URL
      for (const key in row) {
        const value = row[key];
        if (value && value.startsWith("http")) {
          insertStmt.run(value.trim());
          rowCount++;
        }
      }
    })
    .on("end", () => {
      fs.unlinkSync(filePath); // cleanup uploaded file
      res.json({
        message: "CSV processed successfully",
        rowsInserted: rowCount,
      });
    })
    .on("error", (err) => {
      console.error("CSV parse error:", err);
      res.status(500).json({ error: "Failed to parse CSV" });
    });
});


// ----------- Start server -----------
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
