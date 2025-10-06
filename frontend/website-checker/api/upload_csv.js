// /api/upload_csv.js
const fs = require("fs");
const csv = require("csv-parser");
const { formidable } = require("formidable");
const path = require("path");
const { insertUrl, resetTable } = require("../../../backend/db");

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }


  const form = formidable({ multiples: false, uploadDir: "/tmp", keepExtensions: true });


    // Parse form data (CSV upload)
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parse error:", err);
        return res.status(500).json({ error: "Failed to parse form data" });
      }

      const file = files.csv || files.file; // support `csv` or `file`
      if (!file) {
        return res.status(400).json({ error: "CSV file is required" });
      }

      const filePath = file.filepath || file.path;
      if (!filePath || !fs.existsSync(filePath)) {
        return res.status(400).json({ error: "Invalid file path" });
      }

      // Reset JSON file before inserting
      resetTable();

      let rowCount = 0;

      // Stream through CSV rows
      fs.createReadStream(filePath)
        .pipe(csv({ headers: false, skipLines: 0 }))
        .on("data", (row) => {
          // Loop through each column in the row
          for (const key in row) {
            const value = row[key];
            if (typeof value === "string" && value.startsWith("http")) {
              insertUrl(value);
              rowCount++;
            }
          }
        })
        .on("end", () => {
          // Delete uploaded temp file
          fs.unlinkSync(filePath);

          res.status(200).json({
            message: "CSV processed successfully (JSON reset first)",
            rowsInserted: rowCount,
            savedFile: "data/urls.json",
          });
        })
        .on("error", (err) => {
          console.error("CSV parse error:", err);
          res.status(500).json({ error: "Failed to parse CSV", details: err.message });
        });
    });
  } catch (err) {
    console.error("upload_csv error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};
