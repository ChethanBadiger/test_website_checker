import React, { useState } from "react";

function SiteCheckResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  // Fetch and run checks from /api/check_sites
  const runSiteChecks = async () => {
    setLoading(true);
    setHasRun(true);
    setResults([]);
    try {
      const res = await fetch("/api/check_sites");
      if (!res.ok) throw new Error("Failed to run site checks");
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Error running site checks:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Website Check Results</h2>

      {/* Button to trigger checks */}
      <button
        onClick={runSiteChecks}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#aaa" : "#007bff",
          color: "white",
          padding: "10px 15px",
          border: "none",
          borderRadius: "5px",
          cursor: loading ? "not-allowed" : "pointer",
          marginBottom: "1rem",
        }}
      >
        {loading ? "Running Checks..." : "Run Site Checks"}
      </button>

      {/* Status message */}
      {loading && <p>Running site checks... Please wait.</p>}
      {!loading && hasRun && results.length === 0 && <p>No site check results found.</p>}

      {/* Results table */}
      {!loading && results.length > 0 && (
        <table border="1" cellPadding="5" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>URL</th>
              <th>Status</th>
              <th>Errors</th>
              <th>Final URL</th>
              <th>Screenshot</th>
              <th>Log</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i}>
                <td>
                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                    {r.url}
                  </a>
                </td>
                <td>{r.status}</td>
                <td>{Array.isArray(r.errors) ? r.errors.join(", ") : r.errors}</td>
                <td>{r.finalUrl || "N/A"}</td>
                <td>
                  {r.screenshotPath ? (
                    <a href={r.screenshotPath} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>{r.log}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SiteCheckResults;
