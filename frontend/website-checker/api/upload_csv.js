// /api/upload_csv.js
const fs = require("fs");
const csv = require("csv-parser");
const { formidable } = require("formidable");
const { insertUrl, resetTable } = require("../../../backend/db");

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const form = formidable({ multiples: false, uploadDir: "/tmp", keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: "Failed to parse form data" });

      const fileField = files.csv || files.file;
      const file = Array.isArray(fileField) ? fileField[0] : fileField;

      if (!file || !file.filepath || !fs.existsSync(file.filepath)) {
        return res.status(400).json({ error: "Invalid file path" });
      }

      resetTable();
      let rowCount = 0;
      const insertedUrls = [];

      fs.createReadStream(file.filepath)
        .pipe(csv({ headers: false, skipLines: 0 }))
        .on("data", (row) => {
          for (const key in row) {
            const value = row[key];
            if (typeof value === "string" && value.startsWith("http")) {
              const result = insertUrl(value);
              insertedUrls.push(value);
              rowCount++;
            }
          }
        })
        .on("end", () => {
          fs.unlinkSync(file.filepath);
          res.status(200).json({
            message: "CSV processed successfully",
            rowsInserted: rowCount,
            urls: insertedUrls,
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
