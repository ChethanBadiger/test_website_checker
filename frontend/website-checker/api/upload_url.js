// /api/upload-url.js
const { insertUrl, resetTable } = require("../db");

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Collect body manually (serverless functions don’t auto-parse JSON)
    let body = "";
    for await (const chunk of req) {
      body += chunk;
    }

    const { url } = JSON.parse(body);

    if (!url || !url.startsWith("http")) {
      return res.status(400).json({ error: "A valid URL is required" });
    }

    resetTable();
    insertUrl(url);

    return res.status(200).json({
      message: "Single URL inserted successfully (database reset first)",
      rowsInserted: 1,
    });
  } catch (err) {
    console.error("upload-url error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};
