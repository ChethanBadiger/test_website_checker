// /api/upload-url.js
const { insertUrl, resetTable } = require("../../../backend/db");

module.exports = async (req, res) => {
  try {
    // Allow only POST requests
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Collect body manually (serverless functions may not auto-parse)
    
    let body = "";
    for await (const chunk of req) {
      body += chunk;
    }

    // Parse incoming JSON
    const { url } = JSON.parse(body);

    // Validate the URL
    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      return res.status(400).json({ error: "A valid URL is required" });
    }

    // Reset the JSON "table" (clear previous data)
    resetTable();

    // Insert the new URL
    const result = insertUrl(url);

    return res.status(200).json({
      message: "Single URL inserted successfully (JSON reset first)",
      rowsInserted: result.rowsInserted,
      storedUrl: url,
    });
  } catch (err) {
    console.error("upload-url error:", err);
    return res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
};
