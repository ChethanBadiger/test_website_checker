const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const csv = require("csv-parser");
const { insertUrl, resetTable } = require("./db");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

// ----------- Insert single URL -----------
app.post("/upload-url", (req, res) => {
  const { url } = req.body;

  if (!url || !url.startsWith("http")) {
    return res.status(400).json({ error: "A valid URL is required" });
  }

  resetTable(); // clear all rows + reset id
  insertUrl(url);

  res.json({
    message: "Single URL inserted successfully (database reset first)",
    rowsInserted: 1,
  });
});

// ----------- Insert from CSV file -----------
app.post("/upload-csv", upload.single("csv"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "CSV file is required" });
  }

  resetTable(); // clear all rows + reset id

  const filePath = req.file.path;
  let rowCount = 0;

  fs.createReadStream(filePath)
    .pipe(csv({ headers: false }))
    .on("data", (row) => {
      for (const key in row) {
        const value = row[key];
        if (value && value.startsWith("http")) {
          insertUrl(value);
          rowCount++;
        }
      }
    })
    .on("end", () => {
      fs.unlinkSync(filePath);
      res.json({
        message: "CSV processed successfully (database reset first)",
        rowsInserted: rowCount,
      });
    })
    .on("error", (err) => {
      console.error("CSV parse error:", err);
      res.status(500).json({ error: "Failed to parse CSV" });
    });
});

// ----------- Start server -----------
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log("Server running on http://localhost:5000");
});
