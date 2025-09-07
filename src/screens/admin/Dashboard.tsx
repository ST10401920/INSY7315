import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import Footer from "../../components/Footer";
import "./Dashboard.css";

// Mock data for demo purposes
const mockData = {
  totalUsers: 345,
  activeProperties: 78,
  pendingRequests: 12,
  revenueThisMonth: 128750,
  maintenanceTickets: {
    open: 8,
    inProgress: 5,
    resolved: 17,
    total: 30,
  },
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState(mockData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In a real application, you would fetch actual data from your API
    setLoading(true);
    // Simulate API fetch
    const timer = setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
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
      backgroundColor: "rgba(80, 188, 114, 0.1)",
      color: "#50bc72",
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
        ) : (
          <>
            {/* KPI Overview Cards */}
            <div style={styles.dashboardGrid}>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Total Users</h3>
                <div style={styles.cardValue}>{data.totalUsers}</div>
                <div style={styles.cardTrend}>
                  <span style={styles.positive}>↑ 12%</span>
                  <span style={styles.neutral}>vs last month</span>
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Active Properties</h3>
                <div style={styles.cardValue}>{data.activeProperties}</div>
                <div style={styles.cardTrend}>
                  <span style={styles.positive}>↑ 5%</span>
                  <span style={styles.neutral}>vs last month</span>
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Monthly Revenue</h3>
                <div style={styles.cardValue}>
                  {formatCurrency(data.revenueThisMonth)}
                </div>
                <div style={styles.cardTrend}>
                  <span style={styles.positive}>↑ 8.5%</span>
                  <span style={styles.neutral}>vs last month</span>
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Pending Requests</h3>
                <div style={styles.cardValue}>{data.pendingRequests}</div>
                <div style={styles.cardTrend}>
                  <span style={styles.negative}>↑ 3</span>
                  <span style={styles.neutral}>since yesterday</span>
                </div>
              </div>
            </div>

            {/* Maintenance Tickets Card */}
            <div style={styles.dashboardGrid}>
              <div style={styles.card}>
                <div style={styles.smallCard}>
                  <h3 style={styles.cardTitle}>Maintenance Tickets</h3>
                  <div style={styles.cardValue}>
                    {data.maintenanceTickets.total}
                  </div>
                  <div style={styles.ticketStats}>
                    <div style={styles.ticketItem}>
                      <div style={{ ...styles.ticketValue, color: "#ef4444" }}>
                        {data.maintenanceTickets.open}
                      </div>
                      <div style={styles.ticketLabel}>Open</div>
                    </div>
                    <div style={styles.ticketItem}>
                      <div style={{ ...styles.ticketValue, color: "#f59e0b" }}>
                        {data.maintenanceTickets.inProgress}
                      </div>
                      <div style={styles.ticketLabel}>In Progress</div>
                    </div>
                    <div style={styles.ticketItem}>
                      <div style={{ ...styles.ticketValue, color: "#50bc72" }}>
                        {data.maintenanceTickets.resolved}
                      </div>
                      <div style={styles.ticketLabel}>Resolved</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Cards */}
            <h2 style={styles.sectionTitle}>Quick Navigation</h2>
            <div style={styles.dashboardGrid}>
              <Link
                to="/admin/userManagement"
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

              <Link to="/admin/settings" style={{ textDecoration: "none" }}>
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
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                  </div>
                  <h3 style={styles.navCardTitle}>System Settings</h3>
                  <p style={styles.navCardDescription}>
                    Configure system preferences and application settings.
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
