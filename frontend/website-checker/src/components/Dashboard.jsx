import React, { useState } from "react";

function Dashboard() {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);

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
    if (!url && !file) {
      alert("Please enter a URL or select a CSV file.");
      return;
    }

    setLoading(true);
    try {
      let response;

      if (url) {
        response = await fetch("/api/upload_url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
      } else if (file) {
        const formData = new FormData();
        formData.append("csv", file);
        response = await fetch("/api/upload_csv", { method: "POST", body: formData });
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");

      setUrls(data.urls || []); // ✅ display returned URLs immediately
      alert(`Success: ${data.rowsInserted || 0} row(s) inserted`);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Website Checker Dashboard</h2>

      <div style={{ marginBottom: "1rem" }}>
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

      <div style={{ marginTop: "1rem" }}>
        <h3>Stored URLs:</h3>
        {urls.length === 0 ? (
          <p>No URLs found.</p>
        ) : (
          <ul>
            {urls.map((u, i) => (
              <li key={i}>
                <a href={u} target="_blank" rel="noopener noreferrer">
                  {u}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
