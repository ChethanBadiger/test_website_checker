const fs = require("fs");
const csv = require("csv-parser");
const express = require("express");
const formidable = require("formidable");
const { insertUrl, resetTable } = require("../../../backend/db");

const app = express();

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  app.use(express.json());

  const form = formidable({
    multiples: false,
    uploadDir: "/tmp",
    keepExtensions: true,
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: "Failed to parse form data" });
    }

    if (!files.csv) {
      return res.status(400).json({ error: "CSV file is required" });
    }

    resetTable();

    const filePath = files.csv.filepath;
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
        res.status(200).json({
          message: "CSV processed successfully (database reset first)",
          rowsInserted: rowCount,
        });
      })
      .on("error", (err) => {
        console.error("CSV parse error:", err);
        res.status(500).json({ error: "Failed to parse CSV" });
      });
  });
};
