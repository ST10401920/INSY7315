import React, { useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import Footer from "../../components/Footer";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:3000"; 

const Reports: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [isGenerating, setIsGenerating] = useState(false);

  const months = [
    { value: "01", label: "January" },{ value: "02", label: "February" },{ value: "03", label: "March" },
    { value: "04", label: "April" },{ value: "05", label: "May" },{ value: "06", label: "June" },
    { value: "07", label: "July" },{ value: "08", label: "August" },{ value: "09", label: "September" },
    { value: "10", label: "October" },{ value: "11", label: "November" },{ value: "12", label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());

  const reportTypes = [
    { id: "maintenance", title: "Maintenance Report", description: "Detailed maintenance report", icon: "🔧", color: "#3b82f6" },
    { id: "financial", title: "Financial Report", description: "Revenue & expenses", icon: "💰", color: "#10b981" },
    { id: "occupancy", title: "Occupancy Report", description: "Occupancy & rentals", icon: "🏠", color: "#f59e0b" },
    { id: "performance", title: "Performance Report", description: "System performance metrics", icon: "📊", color: "#8b5cf6" },
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
      // Show helpful message if auth failure
      if (err?.response?.status === 401) {
        alert("Unauthorized — please login again.");
      } else {
        alert("Failed to download report. Check console for details.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // (UI styling omitted for brevity - paste your full layout here if you want)
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <AdminNavbar />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
        <h1>Reports Dashboard</h1>

        <div style={{ margin: "24px 0", padding: 16, background: "#fff", borderRadius: 8 }}>
          <label>
            Month:
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              <option value="">Choose month...</option>
              {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </label>

          <label style={{ marginLeft: 16 }}>
            Year:
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
          {reportTypes.map(rt => (
            <div key={rt.id} style={{ background: "#fff", padding: 16, borderRadius: 8 }}>
              <h3>{rt.icon} {rt.title}</h3>
              <p>{rt.description}</p>
              <button onClick={() => handleDownloadReport(rt.id)} disabled={isGenerating || !selectedMonth || !selectedYear}>
                {isGenerating ? "Generating..." : "Download Report"}
              </button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reports;
