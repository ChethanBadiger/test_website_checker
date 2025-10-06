// /api/get-urls.js
const fs = require("fs");
const path = require("path");

module.exports = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const filePath = path.join(process.cwd(), "data", "urls.json");

    if (!fs.existsSync(filePath)) {
      return res.status(200).json([]); // return empty array if file doesn’t exist
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const urls = Array.isArray(data.urls) ? data.urls : [];

    return res.status(200).json(urls); // ✅ only return array of URLs
  } catch (err) {
    console.error("get-urls error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};
