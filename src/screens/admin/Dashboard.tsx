import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AdminNavbar from "../../components/AdminNavbar";
import Footer from "../../components/Footer";
import "./Dashboard.css";

// Define interface for dashboard stats
interface DashboardStats {
  total_users: number;
  total_maintenance_tasks: number;
  total_properties: number;
  total_active_properties: number;
  total_revenue: number;
}

// Set base URL for all axios requests
axios.defaults.baseURL = "https://insy7315-api-deploy.onrender.com";

// Add axios request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    console.log(
      "Making request to:",
      (config.baseURL || "") + (config.url || "")
    );
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login to view dashboard");
          setLoading(false);
          return;
        }

        // Log token for debugging (only first few characters)
        console.log("Token present:", token.substring(0, 10) + "...");

        const response = await axios.get("/admin-dash", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Server response:", response.data); // Debug log

        if (response.data && response.data.stats) {
          console.log("Stats data:", response.data.stats); // Debug log
          setData(response.data.stats);
        } else {
          console.error("Invalid response structure:", response.data); // Debug log
          setError(
            `Invalid response format from server: ${JSON.stringify(
              response.data
            )}`
          );
        }
      } catch (err: any) {
        console.error("Error fetching dashboard stats:", err);
        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
          // Optionally, redirect to login page
          localStorage.removeItem("token"); // Clear invalid token
        } else if (err.response?.status === 403) {
          setError("You don't have permission to view the dashboard");
        } else {
          setError(
            "Failed to load dashboard data: " +
              (err.response?.data?.message || err.message)
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Styles matching your application's theme
  const styles: Record<string, React.CSSProperties> = {
    container: {
      minHeight: "100vh",
      width: "100vw",
      backgroundColor: "#f9fafb",
      fontFamily: "system-ui, -apple-system, sans-serif",
      position: "absolute",
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      overflowX: "hidden",
    },
    content: {
      maxWidth: "1280px",
      margin: "0 auto",
      padding: "120px 24px 48px", // Space for the fixed navbar
      width: "100%",
      boxSizing: "border-box",
    },
    heading: {
      fontSize: "30px",
      fontWeight: "bold",
      marginBottom: "24px",
      color: "#111827",
    },
    dashboardGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "24px",
      marginBottom: "32px",
    },
    card: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      padding: "24px",
      transition: "transform 0.3s, box-shadow 0.3s",
      border: "1px solid #e5e7eb",
    },
    cardHover: {
      transform: "translateY(-5px)",
      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
    },
    cardTitle: {
      fontSize: "16px",
      fontWeight: 500,
      color: "#6b7280",
      marginBottom: "12px",
    },
    cardValue: {
      fontSize: "36px",
      fontWeight: "bold",
      color: "#111827",
      marginBottom: "8px",
    },
    cardTrend: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      fontSize: "14px",
    },
    positive: {
      color: "#50bc72",
    },
    negative: {
      color: "#ef4444",
    },
    neutral: {
      color: "#9ca3af",
    },
    chartContainer: {
      height: "280px",
      marginBottom: "32px",
    },
    sectionTitle: {
      fontSize: "20px",
      fontWeight: "600",
      color: "#111827",
      marginBottom: "16px",
      marginTop: "32px",
    },
    progressContainer: {
      width: "100%",
      backgroundColor: "#e5e7eb",
      borderRadius: "9999px",
      height: "8px",
    },
    progressBar: {
      borderRadius: "9999px",
      height: "8px",
      background: "linear-gradient(135deg, #50bc72, #41599c)",
    },
    smallCard: {
      display: "flex",
      flexDirection: "column" as const,
      height: "100%",
    },
    ticketStats: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: "16px",
    },
    ticketItem: {
      textAlign: "center" as const,
    },
    ticketValue: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#111827",
    },
    ticketLabel: {
      fontSize: "14px",
      color: "#6b7280",
    },
    // New styles for navigation cards
    navCard: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      border: "1px solid #e5e7eb",
      transition: "all 0.3s ease",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      textAlign: "center" as const,
      height: "100%",
      cursor: "pointer",
    },
    navIcon: {
      background: "linear-gradient(135deg, #50bc72, #41599c)",
      color: "white",
      width: "64px",
      height: "64px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "16px",
    },
    navCardTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#111827",
      marginBottom: "8px",
    },
    navCardDescription: {
      fontSize: "14px",
      color: "#6b7280",
      margin: 0,
    },
  };

  return (
    <div className="dashboard-container" style={styles.container}>
      <AdminNavbar />
      <main style={styles.content}>
        <h1 style={styles.heading}>Admin Dashboard</h1>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p>Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div
            style={{ textAlign: "center", padding: "40px 0", color: "#ef4444" }}
          >
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* KPI Overview Cards */}
            <div style={styles.dashboardGrid}>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Total Users</h3>
                <div style={styles.cardValue}>{data?.total_users || 0}</div>
                <div style={styles.cardTrend}>
                  <span style={styles.neutral}>Registered Users</span>
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Total Properties</h3>
                <div style={styles.cardValue}>
                  {data?.total_properties || 0}
                </div>
                <div style={styles.cardTrend}>
                  <span style={styles.neutral}>Listed Properties</span>
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Active Properties</h3>
                <div style={styles.cardValue}>
                  {data?.total_active_properties || 0}
                </div>
                <div style={styles.cardTrend}>
                  <span style={styles.neutral}>Currently Occupied</span>
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Total Revenue</h3>
                <div style={styles.cardValue}>
                  {formatCurrency(data?.total_revenue || 0)}
                </div>
                <div style={styles.cardTrend}>
                  <span style={styles.neutral}>From Active Properties</span>
                </div>
              </div>
            </div>

            {/* Maintenance Tasks Card */}
            <div style={styles.dashboardGrid}>
              <div style={styles.card}>
                <div style={styles.smallCard}>
                  <h3 style={styles.cardTitle}>Maintenance Tasks</h3>
                  <div style={styles.cardValue}>
                    {data?.total_maintenance_tasks || 0}
                  </div>
                  <div style={styles.cardTrend}>
                    <span style={styles.neutral}>Total Maintenance Tasks</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Cards */}
            <h2 style={styles.sectionTitle}>Quick Navigation</h2>
            <div style={styles.dashboardGrid}>
              <Link to="/admin/users" style={{ textDecoration: "none" }}>
                <div style={styles.navCard} className="nav-card">
                  <div style={styles.navIcon}>
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <h3 style={styles.navCardTitle}>User Management</h3>
                  <p style={styles.navCardDescription}>
                    Manage user accounts, permissions, and roles.
                  </p>
                </div>
              </Link>

              <Link to="/admin/reports" style={{ textDecoration: "none" }}>
                <div style={styles.navCard} className="nav-card">
                  <div style={styles.navIcon}>
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="2"
                        y="3"
                        width="20"
                        height="14"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="8" y1="21" x2="16" y2="21"></line>
                      <line x1="12" y1="17" x2="12" y2="21"></line>
                      <path d="M7 9h.01M12 9h.01M17 9h.01"></path>
                    </svg>
                  </div>
                  <h3 style={styles.navCardTitle}>Reports</h3>
                  <p style={styles.navCardDescription}>
                    Access financial reports, analytics, and data exports.
                  </p>
                </div>
              </Link>

              <Link
                to="/admin/announcements"
                style={{ textDecoration: "none" }}
              >
                <div style={styles.navCard} className="nav-card">
                  <div style={styles.navIcon}>
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <h3 style={styles.navCardTitle}>Announcements</h3>
                  <p style={styles.navCardDescription}>
                    Create and manage announcements for users and tenants.
                  </p>
                </div>
              </Link>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
