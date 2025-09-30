import React, { useState, useEffect } from "react";
import axios from "axios";
import PropertyManagerNavbar from "../../components/PropertyManagerNavbar";
import Footer from "../../components/Footer";
import "../admin/Announcements.css";

// Add hover styles
const hoverStyles = `
  .announcement-card:hover {
    background-color: #f1f5f9 !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1) !important;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = hoverStyles;
  document.head.appendChild(style);
}

interface Announcement {
  id: number;
  title: string;
  message: string;
  created_at: string;
  admin_id: string;
}

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("You must be logged in to view announcements");
        setLoading(false);
        return;
      }

      console.log("Using token:", token.substring(0, 20) + "..."); // Log truncated token for debugging

      const response = await axios.get("http://localhost:3000/announcements", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response received:", response.data); // Debug log
      setAnnouncements(response.data.announcements);
      setLoading(false);
    } catch (err: any) {
      console.error("Full error:", err); // Debug log
      if (err.response?.status === 401) {
        console.error("Session expired. Please log in again");
        // Clear invalid token
        localStorage.removeItem("token");
        // Optionally redirect to login page
        window.location.href = "/login";
      } else {
        console.error(
          err.response?.data?.error || "Failed to fetch announcements"
        );
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const styles: Record<string, React.CSSProperties> = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f9fafb",
      position: "relative",
    },
    content: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "0 24px 48px",
    },
    heading: {
      fontSize: "30px",
      fontWeight: "bold",
      marginBottom: "24px",
      color: "#111827",
    },
    announcement: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "16px",
      position: "relative",
      overflow: "hidden",
    },
    announcementTitle: {
      fontSize: "20px",
      fontWeight: "600",
      color: "#111827",
      marginBottom: "8px",
    },
    announcementMeta: {
      fontSize: "14px",
      color: "#6b7280",
      marginBottom: "16px",
    },
    announcementMessage: {
      fontSize: "16px",
      color: "#374151",
      lineHeight: 1.5,
      whiteSpace: "pre-wrap",
    },
    loadingSpinner: {
      textAlign: "center" as const,
      padding: "40px 0",
      color: "#6b7280",
    },
  };

  return (
    <div style={styles.container}>
      <PropertyManagerNavbar />

      {/* Header Section with Pattern Background */}
      <div
        style={{
          background: "linear-gradient(135deg, #50bc72, #41599c)",
          padding: "60px 0 80px 0",
          marginBottom: "20px",
          width: "100%",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
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
            Announcements
          </h1>
          <p
            style={{
              color: "white",
              fontSize: "18px",
              opacity: 0.9,
            }}
          >
            Stay informed with the latest community updates and news
          </p>
        </div>
      </div>

      <main style={{ ...styles.content, marginTop: "-40px" }}>
        {/* Announcements List */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "32px",
            boxShadow:
              "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Recent Announcements
          </h2>

          {loading ? (
            <div style={styles.loadingSpinner}>Loading announcements...</div>
          ) : announcements.length === 0 ? (
            <div
              style={{
                textAlign: "center" as const,
                padding: "40px 20px",
                color: "#6b7280",
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  margin: "0 auto 16px",
                  color: "#9ca3af",
                  display: "block",
                }}
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              <p
                style={{
                  fontSize: "16px",
                  color: "#6b7280",
                  margin: 0,
                }}
              >
                No announcements yet
              </p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  padding: "20px",
                  marginBottom: "16px",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.2s ease",
                }}
                className="announcement-card"
              >
                <h2
                  style={{
                    ...styles.announcementTitle,
                    color: "#1f2937",
                    fontSize: "18px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  {announcement.title}
                </h2>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#4b5563",
                    fontSize: "14px",
                    marginBottom: "12px",
                    fontWeight: "500",
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
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span style={{ color: "#4b5563" }}>
                    {formatDate(announcement.created_at)}
                  </span>
                </div>
                <p
                  style={{
                    ...styles.announcementMessage,
                    color: "#4b5563",
                    fontSize: "15px",
                    lineHeight: 1.6,
                  }}
                >
                  {announcement.message}
                </p>
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Announcements;
