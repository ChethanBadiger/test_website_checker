import React, { useState } from 'react';

function Dashboard() {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setUrl(""); // reset URL if file chosen
    } else {
      alert("Please upload a valid CSV file.");
      e.target.value = null;
    }
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    setFile(null); // reset file if URL entered
  };

  const handleSubmit = async () => {
    try {
      let response;

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
      console.log(response);
      
      const data = await response.json();
      console.log("Server Response:", data);
      alert(`Success: ${data.rowsInserted} row(s) inserted`);
    } catch (err) {
      console.error("Error:", err);
      alert("Upload failed");
    }
  };

  return (
    <>
      <input
        type="text"
        placeholder="Enter website URL"
        value={url}
        onChange={handleUrlChange}
      />
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
      />
      <button onClick={handleSubmit}>Submit</button>
    </>
  );
}

export default Dashboard;
