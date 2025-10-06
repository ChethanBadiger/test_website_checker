import React, { useEffect, useState } from "react";

function SiteCheckResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch results from /api/check_sites
  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/check_sites");
      if (!res.ok) throw new Error("Failed to fetch results");
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Error fetching site check results:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  if (loading) return <p>Loading site check results...</p>;
  if (!results.length) return <p>No site check results found.</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Website Check Results</h2>
      <table border="1" cellPadding="5" cellSpacing="0">
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
      <button onClick={fetchResults} style={{ marginTop: "1rem" }}>
        Refresh Results
      </button>
    </div>
  );
}

export default SiteCheckResults;
