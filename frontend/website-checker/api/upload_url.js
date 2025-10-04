const { insertUrl, resetTable } = require("../../../backend/db");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const form = formidable({ multiples: false, uploadDir: "/tmp", keepExtensions: true });


  try {
    const body = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", (chunk) => {
        data += chunk;
      });
      req.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    });

    const { url } = body;

    if (!url || !url.startsWith("http")) {
      return res.status(400).json({ error: "A valid URL is required" });
    }

    resetTable();
    insertUrl(url);

    res.status(200).json({
      message: "Single URL inserted successfully (database reset first)",
      rowsInserted: 1,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
