import React, { useState, useEffect } from "react";

function Dashboard() {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [urls, setUrls] = useState([]); // ✅ store the fetched URLs
  const [loading, setLoading] = useState(false);

  // ✅ Fetch stored URLs from backend
  const fetchUrls = async () => {
    try {
      const res = await fetch("/api/get_url");
      if (!res.ok) throw new Error("Failed to fetch URLs");
      const data = await res.json();
      console.log("Fetched URLs:", data);
      setUrls(data); // we’re returning just the array
    } catch (err) {
      console.error("Error fetching URLs:", err);
      setUrls([]);
    }
  };

  // ✅ Fetch URLs on mount
  useEffect(() => {
    fetchUrls();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setUrl("");
    } else {
      alert("Please upload a valid CSV file.");
      e.target.value = null;
    }
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    setFile(null);
  };

  const handleSubmit = async () => {
    try {
      let response;
      setLoading(true);

      if (url) {
        // Case 1: send URL as JSON
        response = await fetch("/api/upload_url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
      } else if (file) {
        // Case 2: send CSV as FormData
        const formData = new FormData();
        formData.append("csv", file);

        response = await fetch("/api/upload_csv", {
          method: "POST",
          body: formData,
        });
      } else {
        alert("Please enter a URL or select a CSV file.");
        return;
      }

      const data = await response.json();
      console.log("Server Response:", data);

      if (response.ok) {
        alert(`✅ Success: ${data.rowsInserted || 0} row(s) inserted`);
        await fetchUrls(); // ✅ refresh displayed URLs
      } else {
        alert(`❌ Error: ${data.error || "Something went wrong"}`);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <h2>Website Checker Dashboard</h2>

        <div>
          <input
            type="text"
            placeholder="Enter website URL"
            value={url}
            onChange={handleUrlChange}
            style={{ marginRight: "1rem", padding: "0.5rem" }}
          />
          <input type="file" accept=".csv" onChange={handleFileChange} />
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Processing..." : "Submit"}
          </button>
        </div>

        <hr />

        <div>
          <h3>Stored URLs:</h3>
            <ul>
              {urls.map((u, i) => (
                <li key={i}>
                  <a href={u} target="_blank" rel="noopener noreferrer">
                    {u}
                  </a>
                </li>
              ))}
            </ul>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
