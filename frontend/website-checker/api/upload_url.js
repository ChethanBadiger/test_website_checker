// /api/upload_url.js
const { insertUrl, resetTable } = require("../../../backend/db");

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    let body = "";
    for await (const chunk of req) body += chunk;
    const { url } = JSON.parse(body);

    if (!url || !url.startsWith("http")) return res.status(400).json({ error: "A valid URL is required" });

    resetTable(); // optional: clear previous URLs if you want
    const result = insertUrl(url);

    return res.status(200).json({
      message: "URL inserted successfully",
      rowsInserted: result.rowsInserted,
      urls: result.urls, // ✅ return the current URLs
    });
  } catch (err) {
    console.error("upload-url error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};
