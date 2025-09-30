import React, { useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import Footer from "../../components/Footer";

const Reports: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate month options
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

  // Generate year options (current year and past 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) =>
    (currentYear - i).toString()
  );

  // Report types available for download
  const reportTypes = [
    {
      id: "maintenance",
      title: "Maintenance Report",
      description:
        "Detailed report of all maintenance requests, assignments, and completion status",
      icon: "🔧",
      color: "#3b82f6",
    },
    {
      id: "financial",
      title: "Financial Report",
      description: "Revenue, expenses, and financial performance metrics",
      icon: "💰",
      color: "#10b981",
    },
    {
      id: "occupancy",
      title: "Occupancy Report",
      description:
        "Property occupancy rates, tenant information, and rental statistics",
      icon: "🏠",
      color: "#f59e0b",
    },
    {
      id: "performance",
      title: "Performance Report",
      description:
        "Overall system performance, task completion rates, and efficiency metrics",
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
      // Simulate API call to generate and download report
      // In a real implementation, this would call your backend API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate file download
      const fileName = `${reportType}-report-${selectedYear}-${selectedMonth}.pdf`;
      console.log(`Downloading ${fileName}`);

      // In a real implementation, you would:
      // const response = await axios.get(`/api/reports/${reportType}?month=${selectedMonth}&year=${selectedYear}`, {
      //   responseType: 'blob'
      // });
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', fileName);
      // document.body.appendChild(link);
      // link.click();
      // link.remove();

      alert(`${fileName} downloaded successfully!`);
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Failed to download report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const styles: Record<string, React.CSSProperties> = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f9fafb",
      position: "relative",
    },
    content: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 24px 48px",
    },
    filterCard: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "32px",
      marginBottom: "32px",
      boxShadow:
        "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
      position: "relative",
      zIndex: 1,
    },
    filterRow: {
      display: "flex",
      gap: "24px",
      alignItems: "end",
      flexWrap: "wrap",
    },
    filterGroup: {
      flex: 1,
      minWidth: "200px",
    },
    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: "600",
      color: "#374151",
      marginBottom: "8px",
    },
    select: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      fontSize: "14px",
      backgroundColor: "white",
      color: "#111827",
      outline: "none",
      transition: "all 0.2s ease",
    },
    reportsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
      gap: "24px",
    },
    reportCard: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      border: "1px solid #e5e7eb",
      transition: "all 0.2s ease",
      position: "relative",
      overflow: "hidden",
    },
    reportHeader: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      marginBottom: "16px",
    },
    reportIcon: {
      fontSize: "32px",
      width: "56px",
      height: "56px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(80, 188, 114, 0.1)",
    },
    reportTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#111827",
      margin: 0,
    },
    reportDescription: {
      fontSize: "14px",
      color: "#6b7280",
      lineHeight: 1.5,
      marginBottom: "20px",
    },
    downloadButton: {
      width: "100%",
      padding: "12px 20px",
      borderRadius: "8px",
      border: "none",
      background: "linear-gradient(135deg, #50bc72, #41599c)",
      color: "white",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },
    downloadButtonDisabled: {
      opacity: 0.6,
      cursor: "not-allowed",
    },
    loadingSpinner: {
      width: "16px",
      height: "16px",
      border: "2px solid transparent",
      borderTop: "2px solid currentColor",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
  };

  // Add CSS animation for spinner
  const spinnerCSS = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = spinnerCSS;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={styles.container}>
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

      <main style={{ ...styles.content, marginTop: "-60px" }}>
        {/* Filter Section */}
        <div style={styles.filterCard}>
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
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.label}>Select Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={styles.select}
              >
                <option value="">Choose month...</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.label}>Select Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={styles.select}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div style={styles.reportsGrid}>
          {reportTypes.map((report) => (
            <div
              key={report.id}
              style={{
                ...styles.reportCard,
                transform:
                  selectedMonth && selectedYear
                    ? "translateY(0)"
                    : "translateY(0)",
                opacity: selectedMonth && selectedYear ? 1 : 0.7,
              }}
            >
              <div style={styles.reportHeader}>
                <div
                  style={{
                    ...styles.reportIcon,
                    backgroundColor: `${report.color}15`,
                  }}
                >
                  <span style={{ fontSize: "24px" }}>{report.icon}</span>
                </div>
                <h3 style={styles.reportTitle}>{report.title}</h3>
              </div>
              <p style={styles.reportDescription}>{report.description}</p>
              <button
                style={{
                  ...styles.downloadButton,
                  ...(!selectedMonth || !selectedYear || isGenerating
                    ? styles.downloadButtonDisabled
                    : {}),
                }}
                onClick={() => handleDownloadReport(report.id)}
                disabled={!selectedMonth || !selectedYear || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div style={styles.loadingSpinner}></div>
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
              Reports are generated in PDF format for easy sharing and printing
            </li>
            <li>All data is filtered by the selected month and year</li>
            <li>Reports include comprehensive analytics and visualizations</li>
            <li>
              Generated reports are automatically timestamped for record keeping
            </li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Reports;
