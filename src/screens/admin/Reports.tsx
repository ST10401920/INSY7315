import React, { useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import Footer from "../../components/Footer";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:3000";

const Reports: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) =>
    (currentYear - i).toString()
  );

  const reportTypes = [
    {
      id: "maintenance",
      title: "Maintenance Report",
      description: "Detailed maintenance report",
      icon: "🔧",
      color: "#3b82f6",
    },
    {
      id: "financial",
      title: "Financial Report",
      description: "Revenue & expenses",
      icon: "💰",
      color: "#10b981",
    },
    {
      id: "occupancy",
      title: "Occupancy Report",
      description: "Occupancy & rentals",
      icon: "🏠",
      color: "#f59e0b",
    },
    {
      id: "performance",
      title: "Performance Report",
      description: "System performance metrics",
      icon: "📊",
      color: "#8b5cf6",
    },
  ];

  const handleDownloadReport = async (reportType: string) => {
    if (!selectedMonth || !selectedYear) {
      alert("Please select both month and year");
      return;
    }

    setIsGenerating(true);

    try {
      const token = localStorage.getItem("token"); // if your auth stores token here
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await axios.get(
        `/api/reports/${reportType}?month=${selectedMonth}&year=${selectedYear}`,
        {
          responseType: "blob",
          headers,
        }
      );

      if (!response.data || response.data.size === 0) {
        alert("❌ The PDF file is empty or not generated correctly.");
        return;
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = `${reportType}-report-${selectedYear}-${selectedMonth}.pdf`;
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert(`✅ ${fileName} downloaded successfully!`);
    } catch (err: any) {
      console.error("Error downloading report:", err);

      // If the error response is a blob (likely JSON), read it
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          console.error("Error response text:", text);
          const errorData = JSON.parse(text);
          console.error("Parsed error:", errorData);
          alert(
            `❌ Server error: ${
              errorData.error || errorData.message || "Unknown error"
            }`
          );
        } catch (blobErr) {
          console.error("Could not parse blob error:", blobErr);
          alert(
            "❌ Server error generating report. Check backend logs for details."
          );
        }
      } else {
        console.error("Error response:", err.response?.data);
        console.error("Error status:", err.response?.status);

        // Show helpful message if auth failure
        if (err?.response?.status === 401) {
          alert("Unauthorized — please login again.");
        } else if (err?.response?.status === 500) {
          alert(
            "❌ Server error generating report. Check backend logs for details."
          );
        } else {
          alert("Failed to download report. Check console for details.");
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // (UI styling omitted for brevity - paste your full layout here if you want)
  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f9fafb",
          position: "relative",
        }}
      >
        <AdminNavbar />

        {/* Header Section with Pattern Background */}
        <div
          style={{
            background: "linear-gradient(135deg, #50bc72, #41599c)",
            padding: "100px 0 80px 0",
            marginBottom: "20px",
            width: "100%",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "0 24px",
            }}
          >
            <h1
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                color: "white",
                marginBottom: "16px",
              }}
            >
              📊 Reports Dashboard
            </h1>
            <p
              style={{
                color: "white",
                fontSize: "18px",
                opacity: 0.9,
              }}
            >
              Generate and download comprehensive reports for your property
              management system
            </p>
          </div>
        </div>

        <main
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 24px 48px",
            marginTop: "-60px",
          }}
        >
          {/* Filter Section */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "32px",
              marginBottom: "32px",
              boxShadow:
                "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
              position: "relative",
              zIndex: 1,
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#111827",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              Filter Reports
            </h2>
            <div
              style={{
                display: "flex",
                gap: "24px",
                alignItems: "end",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: "200px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  Select Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "14px",
                    backgroundColor: "white",
                    color: "#111827",
                    outline: "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <option value="">Choose month...</option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1, minWidth: "200px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  Select Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "14px",
                    backgroundColor: "white",
                    color: "#111827",
                    outline: "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Reports Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: "24px",
            }}
          >
            {reportTypes.map((rt) => (
              <div
                key={rt.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  border: "1px solid #e5e7eb",
                  transition: "all 0.2s ease",
                  position: "relative",
                  overflow: "hidden",
                  opacity: selectedMonth && selectedYear ? 1 : 0.7,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "32px",
                      width: "56px",
                      height: "56px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: `${rt.color}15`,
                    }}
                  >
                    <span style={{ fontSize: "24px" }}>{rt.icon}</span>
                  </div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#111827",
                      margin: 0,
                    }}
                  >
                    {rt.title}
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    lineHeight: 1.5,
                    marginBottom: "20px",
                  }}
                >
                  {rt.description}
                </p>
                <button
                  onClick={() => handleDownloadReport(rt.id)}
                  disabled={isGenerating || !selectedMonth || !selectedYear}
                  style={{
                    width: "100%",
                    padding: "12px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #50bc72, #41599c)",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor:
                      !selectedMonth || !selectedYear || isGenerating
                        ? "not-allowed"
                        : "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    opacity:
                      !selectedMonth || !selectedYear || isGenerating ? 0.6 : 1,
                  }}
                >
                  {isGenerating ? (
                    <>
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid transparent",
                          borderTop: "2px solid currentColor",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      ></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Download Report
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Info Section */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              marginTop: "32px",
              border: "1px solid #e5e7eb",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#111827",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              Report Information
            </h3>
            <ul
              style={{
                color: "#6b7280",
                fontSize: "14px",
                lineHeight: 1.6,
                paddingLeft: "20px",
                margin: 0,
              }}
            >
              <li>
                Reports are generated in PDF format for easy sharing and
                printing
              </li>
              <li>All data is filtered by the selected month and year</li>
              <li>
                Reports include comprehensive analytics and visualizations
              </li>
              <li>
                Generated reports are automatically timestamped for record
                keeping
              </li>
            </ul>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Reports;
